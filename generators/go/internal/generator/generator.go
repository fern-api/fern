package generator

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/fern-api/fern-go/internal/ast"
	"github.com/fern-api/fern-go/internal/coordinator"
	"github.com/fern-api/fern-go/internal/fern/ir"
	fernir "github.com/fern-api/fern-go/internal/fern/ir"
	generatorexec "github.com/fern-api/generator-exec-go"
)

const (
	// embeddedCoreImportPath is the import path for the core package
	// used in the embedded files.
	embeddedCoreImportPath = "github.com/fern-api/fern-go/internal/generator/sdk/core"

	// sharedTypesFilename is the filename for the shared types file.
	sharedTypesFilename = "types.go"

	// packageDocsFilename represents the standard package documentation filename.
	packageDocsFilename = "doc.go"

	// defaultExportedClientName is the default name for the generated client.
	defaultExportedClientName = "Client"
)

// Mode is an enum for different generator modes (i.e. types, client, etc).
type Mode uint8

const (
	ModeModel = iota + 1
	ModeClient
	ModeFiber
)

// Generator represents the Go code generator.
type Generator struct {
	config      *Config
	coordinator *coordinator.Client
}

// File is a generated file.
type File struct {
	Path    string
	Content []byte
}

// SubpackageToGenerate represents a subpackage that needs to be generated. It contains
// a reference to a (potentially) modified HttpService, and its original FernFilepath.
//
// A service's FernFilepath is modified whenever it it represents an implicit root package
// (e.g. a config.yml adjacent to a config/ directory is treated as if the config.yml is
// defined at config/__package__.yml). However, the scope for any in-lined requests
// must maintain their original definition, so we persist that here.
type SubpackageToGenerate struct {
	Subpackage           *fernir.Subpackage
	OriginalFernFilepath *fernir.FernFilepath
}

// NewSubpackagesToGenerate returns a slice of subpackages to generate from the given IR.
func NewSubpackagesToGenerate(ir *fernir.IntermediateRepresentation) []*SubpackageToGenerate {
	var subpackagesToGenerate []*SubpackageToGenerate
	for _, irSubpackage := range ir.Subpackages {
		originalFernFilepath := irSubpackage.FernFilepath
		if len(irSubpackage.Subpackages) > 0 && irSubpackage.FernFilepath.File != nil {
			// This represents a nested root package, so we need to deposit
			// the client in client subpackage (e.g. user/client).
			//
			// We do this by updating the FernFilepath for the subpackage
			// and service (if any).
			irSubpackage.FernFilepath = &fernir.FernFilepath{
				AllParts:    irSubpackage.FernFilepath.AllParts,
				PackagePath: append(irSubpackage.FernFilepath.PackagePath, irSubpackage.FernFilepath.File),
				File:        nil,
			}
			if irSubpackage.Service != nil {
				irService := ir.Services[*irSubpackage.Service]
				irService.Name.FernFilepath = &fernir.FernFilepath{
					AllParts:    irService.Name.FernFilepath.AllParts,
					PackagePath: append(irService.Name.FernFilepath.PackagePath, irService.Name.FernFilepath.File),
					File:        nil,
				}
			}
		}
		subpackagesToGenerate = append(
			subpackagesToGenerate,
			&SubpackageToGenerate{
				Subpackage:           irSubpackage,
				OriginalFernFilepath: originalFernFilepath,
			},
		)
	}
	return subpackagesToGenerate
}

// NewFile returns a new *File with the given content, and send a log to the coordinator.
func NewFile(coordinator *coordinator.Client, filename string, content []byte) *File {
	// It's OK if we fail to send an update to the coordinator - we shouldn't fail
	// generation when we'd otherwise succeed just because a log is missed.
	_ = coordinator.Log(
		generatorexec.LogLevelDebug,
		fmt.Sprintf("Generated %s", filename),
	)
	return &File{
		Path:    filename,
		Content: content,
	}
}

// New returns a new *Generator.
func New(config *Config, coordinator *coordinator.Client) (*Generator, error) {
	return &Generator{
		config:      config,
		coordinator: coordinator,
	}, nil
}

// GenerateTypes runs the code generation process.
func (g *Generator) Generate(mode Mode) ([]*File, error) {
	ir, err := readIR(g.config.IRFilepath)
	if err != nil {
		return nil, fmt.Errorf("failed to read IR: %w", err)
	}
	return g.generate(ir, mode)
}

func (g *Generator) generateModelTypes(ir *fernir.IntermediateRepresentation, mode Mode, rootPackageName string) ([]*File, error) {
	fileInfoToTypes, err := fileInfoToTypes(
		rootPackageName,
		ir.Types,
		ir.Services,
		ir.ServiceTypeReferenceInfo,
		g.config.InlinePathParameters,
		g.config.InlineFileProperties,
	)
	if err != nil {
		return nil, err
	}
	files := make([]*File, 0, len(fileInfoToTypes))
	for fileInfo, typesToGenerate := range fileInfoToTypes {
		writer := newFileWriter(
			fileInfo.filename,
			fileInfo.packageName,
			g.config.ImportPath,
			g.config.Whitelabel,
			g.config.AlwaysSendRequiredProperties,
			g.config.InlinePathParameters,
			g.config.InlineFileProperties,
			g.config.UnionVersion,
			ir.Types,
			ir.Errors,
			g.coordinator,
		)
		for _, typeToGenerate := range typesToGenerate {
			switch {
			case typeToGenerate.TypeDeclaration != nil:
				if err := writer.WriteType(typeToGenerate.TypeDeclaration, mode == ModeClient); err != nil {
					return nil, err
				}
			case typeToGenerate.Endpoint != nil:
				if mode == ModeFiber {
					if err := writer.WriteFiberRequestType(typeToGenerate.FernFilepath, typeToGenerate.Endpoint, g.config.EnableExplicitNull); err != nil {
						return nil, err
					}
				} else if mode == ModeClient {
					if err := writer.WriteRequestType(
						typeToGenerate.FernFilepath,
						typeToGenerate.Endpoint,
						typeToGenerate.Service.Headers,
						ir.IdempotencyHeaders,
						g.config.EnableExplicitNull,
						g.config.InlineFileProperties,
					); err != nil {
						return nil, err
					}
				}
			}
		}
		file, err := writer.File()
		if err != nil {
			return nil, err
		}
		files = append(files, file)
	}
	return files, nil
}

func (g *Generator) generate(ir *fernir.IntermediateRepresentation, mode Mode) ([]*File, error) {
	if g.config.ImportPath == "" {
		// If an import path is not configured, we need to validate that none of types
		// import types from another package.
		for _, typeDeclaration := range ir.Types {
			typeImportPath := fernFilepathToImportPath(g.config.ImportPath, typeDeclaration.Name.FernFilepath)
			for _, referencedType := range declaredTypeNamesForTypeIDs(ir, typeDeclaration.ReferencedTypes) {
				referencedImportPath := fernFilepathToImportPath(g.config.ImportPath, referencedType.FernFilepath)
				if typeImportPath != referencedImportPath {
					return nil, fmt.Errorf(
						"%s references %s from another package, but a generator import path was not specified",
						typeDeclaration.Name.TypeId,
						referencedType.TypeId,
					)
				}
			}
		}
	}
	exportedClientName := getExportedClientName(ir, g.config.ExportedClientName)
	rootPackageName := getRootPackageName(ir, g.config.PackageName)
	cycleInfo, err := cycleInfoFromIR(ir, g.config.ImportPath)
	if err != nil {
		return nil, fmt.Errorf("failed to cycle info from IR: %w", err)
	}
	if cycleInfo != nil {
		for _, leafType := range cycleInfo.LeafTypes {
			// Update every leaf type's FernFilepath so that the rest of
			// the types reference it from the appropriate location.
			typeDecl := ir.Types[leafType]

			var packagePathElement *fernir.Name
			if packagePath := typeDecl.Name.FernFilepath.PackagePath; len(packagePath) > 0 {
				packagePathElement = packagePath[len(packagePath)-1]
			}

			newFernFilepath := &fernir.FernFilepath{
				AllParts: []*fernir.Name{
					commonPackageElement,
				},
				PackagePath: []*fernir.Name{
					commonPackageElement,
				},
				File: commonPackageElement,
			}
			if packagePathElement != nil {
				newFernFilepath.AllParts = append(newFernFilepath.AllParts, packagePathElement)
				newFernFilepath.PackagePath = append(newFernFilepath.PackagePath, packagePathElement)
			}
			newFernFilepath.AllParts = append(newFernFilepath.AllParts, commonPackageElement)

			replaceFilepathForTypeInIR(ir, typeDecl.Name.TypeId, newFernFilepath)
		}
	}
	// First determine what types will be generated so that we can determine whether or not there will
	// be any conflicts.
	var (
		generatedNames    = generatedNamesFromIR(ir)
		generatedPackages = generatedPackagesFromIR(ir)
	)
	var files []*File
	// Write all of the package-level documentation, if any (i.e. in a doc.go file).
	if ir.RootPackage != nil && ir.RootPackage.Docs != nil && len(*ir.RootPackage.Docs) > 0 {
		fileInfo := fileInfoForPackage(rootPackageName, ir.RootPackage.FernFilepath)
		writer := newFileWriter(
			fileInfo.filename,
			fileInfo.packageName,
			"",
			g.config.Whitelabel,
			g.config.AlwaysSendRequiredProperties,
			g.config.InlinePathParameters,
			g.config.InlineFileProperties,
			g.config.UnionVersion,
			nil,
			nil,
			g.coordinator,
		)
		writer.WriteDocs(ir.RootPackage.Docs)
		files = append(files, writer.DocsFile())
	}
	for _, subpackage := range ir.Subpackages {
		if subpackage.Docs == nil || len(*subpackage.Docs) == 0 {
			continue
		}
		fileInfo := fileInfoForPackageDocs(subpackage.FernFilepath)
		writer := newFileWriter(
			fileInfo.filename,
			fileInfo.packageName,
			"",
			g.config.Whitelabel,
			g.config.AlwaysSendRequiredProperties,
			g.config.InlinePathParameters,
			g.config.InlineFileProperties,
			g.config.UnionVersion,
			nil,
			nil,
			g.coordinator,
		)
		writer.WriteDocs(subpackage.Docs)
		files = append(files, writer.DocsFile())
	}
	// Then split up all the types based on the Fern directory they belong to (i.e. the root package,
	// or some other subpackage).
	modelFiles, err := g.generateModelTypes(ir, mode, rootPackageName)
	if err != nil {
		return nil, err
	}
	files = append(files, modelFiles...)
	files = append(files, newStringerFile(g.coordinator))
	files = append(files, newTimeFile(g.coordinator))
	files = append(files, newExtraPropertiesFile(g.coordinator))
	files = append(files, newExtraPropertiesTestFile(g.coordinator))
	// Then handle mode-specific generation tasks.
	var rootClientInstantiation *ast.AssignStmt
	generatedRootClient := &GeneratedClient{
		Instantiation: rootClientInstantiation,
	}
	var generatedPagination bool
	switch mode {
	case ModeFiber:
		break
	case ModeClient:
		var (
			generatedAuth        *GeneratedAuth
			generatedEnvironment *GeneratedEnvironment
		)
		generatedPagination = needsPaginationHelpers(ir)
		// Generate the core API files.
		fileInfo := fileInfoForRequestOptionsDefinition()
		writer := newFileWriter(
			fileInfo.filename,
			fileInfo.packageName,
			g.config.ImportPath,
			g.config.Whitelabel,
			g.config.AlwaysSendRequiredProperties,
			g.config.InlinePathParameters,
			g.config.InlineFileProperties,
			g.config.UnionVersion,
			ir.Types,
			ir.Errors,
			g.coordinator,
		)
		if err := writer.WriteRequestOptionsDefinition(
			ir.Auth,
			ir.Headers,
			ir.IdempotencyHeaders,
			ir.SdkConfig,
			g.config.ModuleConfig,
			g.config.Version,
		); err != nil {
			return nil, fmt.Errorf("failed to write request options definition: %w", err)
		}
		file, err := writer.File()
		if err != nil {
			return nil, fmt.Errorf("failed to open new writer.File: %w", err)
		}
		files = append(files, file)
		if ir.Environments != nil {
			// Generate the core environments file.
			fileInfo, useCore := fileInfoForEnvironments(rootPackageName, generatedNames, generatedPackages)
			writer = newFileWriter(
				fileInfo.filename,
				fileInfo.packageName,
				g.config.ImportPath,
				g.config.Whitelabel,
				g.config.AlwaysSendRequiredProperties,
				g.config.InlinePathParameters,
				g.config.InlineFileProperties,
				g.config.UnionVersion,
				ir.Types,
				ir.Errors,
				g.coordinator,
			)
			generatedEnvironment, err = writer.WriteEnvironments(ir.Environments, useCore)
			if err != nil {
				return nil, fmt.Errorf("failed to write environments: %w", err)
			}
			file, err = writer.File()
			if err != nil {
				return nil, fmt.Errorf("failed to open new writer.File: %w", err)
			}
			files = append(files, file)
		}
		// Generate the request options.
		fileInfo = fileInfoForRequestOptions()
		writer = newFileWriter(
			fileInfo.filename,
			fileInfo.packageName,
			g.config.ImportPath,
			g.config.Whitelabel,
			g.config.AlwaysSendRequiredProperties,
			g.config.InlinePathParameters,
			g.config.InlineFileProperties,
			g.config.UnionVersion,
			ir.Types,
			ir.Errors,
			g.coordinator,
		)
		generatedAuth, err = writer.WriteRequestOptions(ir.Auth, ir.Headers)
		if err != nil {
			return nil, fmt.Errorf("failed to write request options: %w", err)
		}
		file, err = writer.File()
		if err != nil {
			return nil, fmt.Errorf("failed to open new writer.File: %w", err)
		}
		files = append(files, file)
		rootClientInstantiation = generatedClientInstantiation(
			g.config.ImportPath,
			generatedAuth,
			generatedEnvironment,
			exportedClientName,
		)
		if len(ir.IdempotencyHeaders) > 0 {
			fileInfo = fileInfoForIdempotentRequestOptionsDefinition()
			writer = newFileWriter(
				fileInfo.filename,
				fileInfo.packageName,
				g.config.ImportPath,
				g.config.Whitelabel,
				g.config.AlwaysSendRequiredProperties,
				g.config.InlinePathParameters,
				g.config.InlineFileProperties,
				g.config.UnionVersion,
				ir.Types,
				ir.Errors,
				g.coordinator,
			)
			if err := writer.WriteIdempotentRequestOptionsDefinition(ir.IdempotencyHeaders); err != nil {
				return nil, fmt.Errorf("failed to write idempotent request options definition: %w", err)
			}
			file, err = writer.File()
			if err != nil {
				return nil, fmt.Errorf("failed to open new writer.File: %w", err)
			}
			files = append(files, file)
			fileInfo = fileInfoForIdempotentRequestOptions()
			writer = newFileWriter(
				fileInfo.filename,
				fileInfo.packageName,
				g.config.ImportPath,
				g.config.Whitelabel,
				g.config.AlwaysSendRequiredProperties,
				g.config.InlinePathParameters,
				g.config.InlineFileProperties,
				g.config.UnionVersion,
				ir.Types,
				ir.Errors,
				g.coordinator,
			)
			if err := writer.WriteIdempotentRequestOptions(ir.IdempotencyHeaders); err != nil {
				return nil, fmt.Errorf("failed to write idempotent request options: %w", err)
			}
			file, err = writer.File()
			if err != nil {
				return nil, fmt.Errorf("failed to open new writer.File: %w", err)
			}
			files = append(files, file)
		}
		if g.config.IncludeLegacyClientOptions {
			// Generate the legacy client option helper functions (for backwards compatibility).
			fileInfo = fileInfoForLegacyClientOptions()
			writer = newFileWriter(
				fileInfo.filename,
				fileInfo.packageName,
				g.config.ImportPath,
				g.config.Whitelabel,
				g.config.AlwaysSendRequiredProperties,
				g.config.InlinePathParameters,
				g.config.InlineFileProperties,
				g.config.UnionVersion,
				ir.Types,
				ir.Errors,
				g.coordinator,
			)
			if err = writer.WriteLegacyClientOptions(ir.Auth, ir.Headers, ir.IdempotencyHeaders); err != nil {
				return nil, fmt.Errorf("failed to write legacy client options: %w", err)
			}
			file, err = writer.File()
			if err != nil {
				return nil, fmt.Errorf("failed to open new writer.File: %w", err)
			}
			files = append(files, file)
		}
		// Generate the Optional[T] constructors.
		fileInfo, useCore := fileInfoForOptionalHelpers(rootPackageName, generatedNames, generatedPackages)
		writer = newFileWriter(
			fileInfo.filename,
			fileInfo.packageName,
			g.config.ImportPath,
			g.config.Whitelabel,
			g.config.AlwaysSendRequiredProperties,
			g.config.InlinePathParameters,
			g.config.InlineFileProperties,
			g.config.UnionVersion,
			ir.Types,
			ir.Errors,
			g.coordinator,
		)
		if g.config.EnableExplicitNull {
			if err := writer.WriteOptionalHelpers(useCore); err != nil {
				return nil, fmt.Errorf("failed to write optional helpers: %w", err)
			}
			file, err = writer.File()
			if err != nil {
				return nil, fmt.Errorf("failed to open new writer.File: %w", err)
			}
			files = append(files, file)
			files = append(files, newOptionalFile(g.coordinator))
			files = append(files, newOptionalTestFile(g.coordinator))
		}
		files = append(files, newApiErrorFile(g.coordinator))
		files = append(files, newCallerFile(g.coordinator, g.config.ImportPath))
		files = append(files, newCallerTestFile(g.coordinator, g.config.ImportPath))
		files = append(files, newErrorDecoderFile(g.coordinator, g.config.ImportPath))
		files = append(files, newErrorDecoderTestFile(g.coordinator, g.config.ImportPath))
		files = append(files, newFileParamFile(g.coordinator, rootPackageName, generatedNames))
		files = append(files, newHttpCoreFile(g.coordinator))
		files = append(files, newHttpInternalFile(g.coordinator))
		files = append(files, newPointerFile(g.coordinator, rootPackageName, generatedNames))
		files = append(files, newQueryFile(g.coordinator))
		files = append(files, newQueryTestFile(g.coordinator))
		files = append(files, newRetrierFile(g.coordinator, g.config.ImportPath))
		files = append(files, newRetrierTestFile(g.coordinator, g.config.ImportPath))
		if needsFileUploadHelpers(ir) {
			files = append(files, newMultipartFile(g.coordinator))
			files = append(files, newMultipartTestFile(g.coordinator))
		}
		if ir.SdkConfig.HasStreamingEndpoints {
			files = append(files, newStreamFile(g.coordinator))
			files = append(files, newStreamerFile(g.coordinator, g.config.ImportPath))
		}
		if generatedPagination {
			files = append(files, newPageFile(g.coordinator))
			files = append(files, newPagerFile(g.coordinator, g.config.ImportPath))
		}
		clientTestFile, err := newClientTestFile(g.config.ImportPath, g.coordinator)
		if err != nil {
			return nil, fmt.Errorf("failed to create new client test file: %w", err)
		}
		files = append(files, clientTestFile)
		// Generate the error types, if any.
		for fileInfo, irErrors := range fileInfoToErrors(rootPackageName, ir.Errors) {
			writer := newFileWriter(
				fileInfo.filename,
				fileInfo.packageName,
				g.config.ImportPath,
				g.config.Whitelabel,
				g.config.AlwaysSendRequiredProperties,
				g.config.InlinePathParameters,
				g.config.InlineFileProperties,
				g.config.UnionVersion,
				ir.Types,
				ir.Errors,
				g.coordinator,
			)
			for _, irError := range irErrors {
				if err := writer.WriteError(irError); err != nil {
					return nil, fmt.Errorf("failed to write error type: %w", err)
				}
			}
			file, err := writer.File()
			if err != nil {
				return nil, fmt.Errorf("failed to open new writer.File: %w", err)
			}
			files = append(files, file)
		}
		// First generate the client at the root package, if any.
		subpackagesToGenerate := NewSubpackagesToGenerate(ir)
		if ir.RootPackage != nil {
			var rootSubpackages []*fernir.Subpackage
			for _, subpackageID := range ir.RootPackage.Subpackages {
				subpackage := ir.Subpackages[subpackageID]
				if !subpackage.HasEndpointsInTree {
					// We only want to include subpackages that have endpoints.
					continue
				}
				rootSubpackages = append(rootSubpackages, subpackage)
			}
			if ir.RootPackage.Service != nil {
				file, generatedClient, err := g.generateService(
					ir,
					ir.Services[*ir.RootPackage.Service],
					rootSubpackages,
					rootClientInstantiation,
					ir.RootPackage.FernFilepath,
				)
				if err != nil {
					return nil, fmt.Errorf("failed to generate service: %w", err)
				}
				files = append(files, file)

				// Merge this client's endpoints with the root generated client.
				generatedRootClient.Endpoints = append(generatedRootClient.Endpoints, generatedClient.Endpoints...)

			} else {
				file, generatedClient, err := g.generateRootServiceWithoutEndpoints(
					ir,
					ir.RootPackage.FernFilepath,
					rootSubpackages,
					rootClientInstantiation,
				)
				if err != nil {
					return nil, fmt.Errorf("failed to generate root service without endpoints: %w", err)
				}
				files = append(files, file)

				// Merge this client's endpoints with the root generated client.
				generatedRootClient.Endpoints = append(generatedRootClient.Endpoints, generatedClient.Endpoints...)
			}
		}
		// Then generate the client for all of the subpackages.
		for _, subpackageToGenerate := range subpackagesToGenerate {
			irSubpackage := subpackageToGenerate.Subpackage
			var subpackages []*fernir.Subpackage
			for _, subpackageID := range irSubpackage.Subpackages {
				subpackage := ir.Subpackages[subpackageID]
				if !subpackage.HasEndpointsInTree {
					// We only want to include subpackages that have endpoints.
					continue
				}
				subpackages = append(subpackages, subpackage)
			}
			if irSubpackage.Service == nil && len(subpackages) == 0 {
				// This subpackage doesn't have any transitive services,
				// so we don't need to generate a client for it.
				continue
			}
			if irSubpackage.Service == nil {
				// This subpackage doesn't have a service, but we still need
				// to generate an intermediary client for it to access the
				// nested endpoints.
				file, err := g.generateServiceWithoutEndpoints(
					ir,
					irSubpackage,
					subpackages,
					rootClientInstantiation,
					subpackageToGenerate.OriginalFernFilepath,
				)
				if err != nil {
					return nil, fmt.Errorf("failed to generate service without endpoints: %w", err)
				}
				files = append(files, file)
				continue
			}
			// This service has endpoints, so we proceed with the normal flow.
			file, generatedClient, err := g.generateService(
				ir,
				ir.Services[*irSubpackage.Service],
				subpackages,
				rootClientInstantiation,
				subpackageToGenerate.OriginalFernFilepath,
			)
			if err != nil {
				return nil, fmt.Errorf("failed to generate service: %w", err)
			}
			files = append(files, file)

			// Merge this client's endpoints with the root generated client.
			generatedRootClient.Endpoints = append(generatedRootClient.Endpoints, generatedClient.Endpoints...)
		}
	}
	// Write the snippets, if any.
	if g.config.SnippetFilepath != "" {
		if err := maybeWriteSnippets(g.coordinator, generatedRootClient, g.config.SnippetFilepath); err != nil {
			return nil, fmt.Errorf("failed to write snippets: %w", err)
		}
	}
	// Finally, generate the go.mod file, if needed.
	//
	// The go.sum file will be generated after the
	// go.mod file is written to disk.
	if g.config.ModuleConfig != nil {
		requiresGenerics := g.config.EnableExplicitNull || ir.SdkConfig.HasStreamingEndpoints || generatedPagination
		file, generatedGoVersion, err := NewModFile(g.coordinator, g.config.ModuleConfig, requiresGenerics)
		if err != nil {
			return nil, fmt.Errorf("failed to create new go.mod file: %w", err)
		}
		files = append(files, file)

		if g.config.IncludeReadme && generatedRootClient.Instantiation != nil {
			if err := g.generateReadme(generatedRootClient, generatedGoVersion); err != nil {
				return nil, fmt.Errorf("failed to generate readme: %w", err)
			}
			files = append(files, file)
		}
	}
	return files, nil
}

func (g *Generator) generateService(
	ir *fernir.IntermediateRepresentation,
	irService *fernir.HttpService,
	irSubpackages []*fernir.Subpackage,
	rootClientInstantiation *ast.AssignStmt,
	originalFernFilepath *fernir.FernFilepath,
) (*File, *GeneratedClient, error) {
	fileInfo := fileInfoForService(irService.Name.FernFilepath)
	writer := newFileWriter(
		fileInfo.filename,
		fileInfo.packageName,
		g.config.ImportPath,
		g.config.Whitelabel,
		g.config.AlwaysSendRequiredProperties,
		g.config.InlinePathParameters,
		g.config.InlineFileProperties,
		g.config.UnionVersion,
		ir.Types,
		ir.Errors,
		g.coordinator,
	)
	generatedClient, err := writer.WriteClient(
		ir.Auth,
		irService.Endpoints,
		ir.Headers,
		irService.Headers,
		ir.IdempotencyHeaders,
		irSubpackages,
		ir.Environments,
		ir.ErrorDiscriminationStrategy,
		originalFernFilepath,
		rootClientInstantiation,
		g.config.InlinePathParameters,
		g.config.InlineFileProperties,
	)
	if err != nil {
		return nil, nil, err
	}
	file, err := writer.File()
	if err != nil {
		return nil, nil, err
	}
	return file, generatedClient, nil
}

// generateServiceWithoutEndpoints is behaviorally similar to g.generateService, but
// it's suited to write purely intermediary services (i.e. those that don't include
// any endpoints).
func (g *Generator) generateServiceWithoutEndpoints(
	ir *fernir.IntermediateRepresentation,
	irSubpackage *fernir.Subpackage,
	irSubpackages []*fernir.Subpackage,
	rootClientInstantiation *ast.AssignStmt,
	originalFernFilepath *fernir.FernFilepath,
) (*File, error) {
	fileInfo := fileInfoForService(irSubpackage.FernFilepath)
	writer := newFileWriter(
		fileInfo.filename,
		fileInfo.packageName,
		g.config.ImportPath,
		g.config.Whitelabel,
		g.config.AlwaysSendRequiredProperties,
		g.config.InlinePathParameters,
		g.config.InlineFileProperties,
		g.config.UnionVersion,
		ir.Types,
		ir.Errors,
		g.coordinator,
	)
	if _, err := writer.WriteClient(
		ir.Auth,
		nil,
		ir.Headers,
		nil,
		ir.IdempotencyHeaders,
		irSubpackages,
		nil,
		ir.ErrorDiscriminationStrategy,
		originalFernFilepath,
		rootClientInstantiation,
		g.config.InlinePathParameters,
		g.config.InlineFileProperties,
	); err != nil {
		return nil, err
	}
	return writer.File()
}

// generateRootServiceWithoutEndpoints is behaviorally similar to g.generateService, but
// it's suited to write purely intermediary services (i.e. those that don't include
// any endpoints) for the root package.
func (g *Generator) generateRootServiceWithoutEndpoints(
	ir *fernir.IntermediateRepresentation,
	fernFilepath *fernir.FernFilepath,
	irSubpackages []*fernir.Subpackage,
	rootClientInstantiation *ast.AssignStmt,
) (*File, *GeneratedClient, error) {
	fileInfo := fileInfoForService(fernFilepath)
	writer := newFileWriter(
		fileInfo.filename,
		fileInfo.packageName,
		g.config.ImportPath,
		g.config.Whitelabel,
		g.config.AlwaysSendRequiredProperties,
		g.config.InlinePathParameters,
		g.config.InlineFileProperties,
		g.config.UnionVersion,
		ir.Types,
		ir.Errors,
		g.coordinator,
	)
	generatedClient, err := writer.WriteClient(
		ir.Auth,
		nil,
		ir.Headers,
		nil,
		ir.IdempotencyHeaders,
		irSubpackages,
		nil,
		ir.ErrorDiscriminationStrategy,
		fernFilepath,
		rootClientInstantiation,
		g.config.InlinePathParameters,
		g.config.InlineFileProperties,
	)
	if err != nil {
		return nil, nil, err
	}
	file, err := writer.File()
	if err != nil {
		return nil, nil, err
	}
	return file, generatedClient, nil
}

func maybeWriteSnippets(
	coordinator *coordinator.Client,
	generatedClient *GeneratedClient,
	snippetFilepath string,
) error {
	if len(generatedClient.Endpoints) == 0 {
		return nil
	}
	var endpoints []*generatorexec.Endpoint
	for _, generatedEndpoint := range generatedClient.Endpoints {
		client, err := ast.NewSourceCodeBuilder(generatedEndpoint.Snippet).BuildSnippet()
		if err != nil {
			// Log the warning and continue. We don't want to fail generation just
			// because there's a bug in the snippet generator.
			_ = coordinator.Log(
				generatorexec.LogLevelWarn,
				fmt.Sprintf(
					"Failed to generate snippet for endpoint %s %q: %v",
					generatedEndpoint.Identifier.Method,
					generatedEndpoint.Identifier.Path,
					err,
				),
			)
			continue
		}
		endpoints = append(
			endpoints,
			&generatorexec.Endpoint{
				Id: generatedEndpoint.Identifier,
				Snippet: generatorexec.NewEndpointSnippetFromGo(
					&generatorexec.GoEndpointSnippet{
						Client: client,
					},
				),
			},
		)
	}
	// Sort the endpoints for deterministic results.
	sort.Slice(
		endpoints,
		func(i, j int) bool {
			return generatorexecEndpointSnippetToString(endpoints[i]) < generatorexecEndpointSnippetToString(endpoints[j])
		},
	)
	snippets := &generatorexec.Snippets{
		Types:     make(map[ir.TypeId]string),
		Endpoints: endpoints,
	}
	bytes, err := json.MarshalIndent(snippets, "", "    ")
	if err != nil {
		return err
	}
	return os.WriteFile(snippetFilepath, bytes, 0644)
}

// generateReadme generates a README.md file for a generated Go module, called
// if a module config was provided.
//
// Parameters:
//   - generatedClient: The generated client, if any.
//   - generatedGoVersion: The Go version that the generated client supports.
func (g *Generator) generateReadme(
	generatedClient *GeneratedClient,
	generatedGoVersion string,
) (err error) {
	badge := generatorexec.BadgeTypeGo
	capitalizedOrganization := strings.Title(g.config.Organization)

	installation := fmt.Sprintf("Run the following command to use the %s Go library in your module:\n", capitalizedOrganization)
	installation += "```sh\n"
	installation += fmt.Sprintf("go get %s\n", g.config.ModuleConfig.Path)
	installation += "```\n"

	var usage string
	if generatedClient != nil {
		usage, err = ast.NewSourceCodeBuilder(generatedClient.Instantiation).BuildSnippet()
		if err != nil {
			return err
		}
		usage = "```go\n" + usage + "\n```\n"
	}

	return g.coordinator.GenerateReadme(
		&generatorexec.GenerateReadmeRequest{
			Title: fmt.Sprintf("%s Go Library", capitalizedOrganization),
			Badge: &badge,
			Summary: fmt.Sprintf(
				"The %s Go library provides convenient access to the %s API from Go.",
				capitalizedOrganization,
				capitalizedOrganization,
			),
			Requirements: []string{
				fmt.Sprintf("Go version >= %s", generatedGoVersion),
			},
			Installation: generatorexec.String(installation),
			Usage:        usage,
		},
	)
}

// readIR reads the *InermediateRepresentation from the given filename.
func readIR(irFilename string) (*fernir.IntermediateRepresentation, error) {
	bytes, err := os.ReadFile(irFilename)
	if err != nil {
		return nil, fmt.Errorf("failed to read intermediate representation: %v", err)
	}
	ir := new(fernir.IntermediateRepresentation)
	if err := json.Unmarshal(bytes, ir); err != nil {
		return nil, fmt.Errorf("failed to unmarshal intermediate representation: %v", err)
	}
	return ir, nil
}

// declaredTypeNamesForTypeIDs resolves the set of typeIDs to their respective
// declared type names.
func declaredTypeNamesForTypeIDs(ir *fernir.IntermediateRepresentation, typeIDs []fernir.TypeId) []*fernir.DeclaredTypeName {
	result := make([]*fernir.DeclaredTypeName, 0, len(typeIDs))
	for _, typeDecl := range ir.Types {
		result = append(result, typeDecl.Name)
	}
	return result
}

// newPointerFile returns a *File containing the pointer helper functions
// used to more easily instantiate pointers to primitive values (e.g. *string).
//
// In general, this file is deposited at the root of the SDK so that users can
// access the helpers alongside the rest of the top-level definitions. However,
// if any naming conflict exists between the generated types, this file is
// deposited in the core package.
func newPointerFile(coordinator *coordinator.Client, rootPackageName string, generatedNames map[string]struct{}) *File {
	// First determine whether or not we need to generate the type in the
	// core package.
	var useCorePackage bool
	for generatedName := range generatedNames {
		if _, ok := pointerFunctionNames[generatedName]; ok {
			useCorePackage = true
			break
		}
	}
	if useCorePackage {
		return NewFile(
			coordinator,
			"core/pointer.go",
			[]byte(pointerFile),
		)
	}
	// We're going to generate the pointers at the root of the repository,
	// so now we need to determine whether or not we can use the standard
	// filename, or if it needs a prefix.
	filename := "pointer.go"
	if _, ok := generatedNames["Pointer"]; ok {
		filename = "_pointer.go"
	}
	// Finally, we need to replace the package declaration so that it matches
	// the root package declaration of the generated SDK.
	content := strings.Replace(
		pointerFile,
		"package core",
		fmt.Sprintf("package %s", rootPackageName),
		1,
	)
	return NewFile(
		coordinator,
		filename,
		[]byte(content),
	)
}

// newFileParamFile returns a *File containing the FileParam helper type
// for multipart file uploads.
//
// In general, this file is deposited at the root of the SDK so that users can
// access the helpers alongside the rest of the top-level definitions. However,
// if any naming conflict exists between the generated types, this file is
// deposited in the core package.
func newFileParamFile(coordinator *coordinator.Client, rootPackageName string, generatedNames map[string]struct{}) *File {
	// First determine whether or not we need to generate the type in the
	// core package.
	var useCorePackage bool
	for generatedName := range generatedNames {
		if _, ok := pointerFunctionNames[generatedName]; ok {
			useCorePackage = true
			break
		}
	}
	if useCorePackage {
		return NewFile(
			coordinator,
			"core/file_param.go",
			[]byte(fileParamFile),
		)
	}
	// We're going to generate the pointers at the root of the repository,
	// so now we need to determine whether or not we can use the standard
	// filename, or if it needs a prefix.
	filename := "file_param.go"
	if _, ok := generatedNames["FileParam"]; ok {
		filename = "_file_param.go"
	}
	// Finally, we need to replace the package declaration so that it matches
	// the root package declaration of the generated SDK.
	content := strings.Replace(
		fileParamFile,
		"package core",
		fmt.Sprintf("package %s", rootPackageName),
		1,
	)
	return NewFile(
		coordinator,
		filename,
		[]byte(content),
	)
}

func newClientTestFile(
	baseImportPath string,
	coordinator *coordinator.Client,
) (*File, error) {
	f := newFileWriter(
		"client/client_test.go",
		"client",
		baseImportPath,
		false,
		false,
		false,
		false,
		UnionVersionUnspecified,
		nil,
		nil,
		coordinator,
	)
	f.WriteRaw(clientTestFile)
	return f.File()
}

func newApiErrorFile(coordinator *coordinator.Client) *File {
	return NewFile(
		coordinator,
		"core/api_error.go",
		[]byte(apiErrorFile),
	)
}

func newCallerFile(coordinator *coordinator.Client, baseImportPath string) *File {
	content := replaceCoreImportPath(callerFile, baseImportPath)
	return NewFile(
		coordinator,
		"internal/caller.go",
		[]byte(content),
	)
}

func newCallerTestFile(coordinator *coordinator.Client, baseImportPath string) *File {
	content := replaceCoreImportPath(callerTestFile, baseImportPath)
	return NewFile(
		coordinator,
		"internal/caller_test.go",
		[]byte(content),
	)
}

func newErrorDecoderFile(coordinator *coordinator.Client, baseImportPath string) *File {
	content := replaceCoreImportPath(errorDecoderFile, baseImportPath)
	return NewFile(
		coordinator,
		"internal/error_decoder.go",
		[]byte(content),
	)
}

func newErrorDecoderTestFile(coordinator *coordinator.Client, baseImportPath string) *File {
	content := replaceCoreImportPath(errorDecoderTestFile, baseImportPath)
	return NewFile(
		coordinator,
		"internal/error_decoder_test.go",
		[]byte(content),
	)
}

func newHttpCoreFile(coordinator *coordinator.Client) *File {
	return NewFile(
		coordinator,
		"core/http.go",
		[]byte(httpCoreFile),
	)
}

func newHttpInternalFile(coordinator *coordinator.Client) *File {
	return NewFile(
		coordinator,
		"internal/http.go",
		[]byte(httpInternalFile),
	)
}

func newMultipartFile(coordinator *coordinator.Client) *File {
	return NewFile(
		coordinator,
		"internal/multipart.go",
		[]byte(multipartFile),
	)
}

func newMultipartTestFile(coordinator *coordinator.Client) *File {
	return NewFile(
		coordinator,
		"internal/multipart_test.go",
		[]byte(multipartTestFile),
	)
}

func newOptionalFile(coordinator *coordinator.Client) *File {
	return NewFile(
		coordinator,
		"core/optional.go",
		[]byte(optionalFile),
	)
}

func newOptionalTestFile(coordinator *coordinator.Client) *File {
	return NewFile(
		coordinator,
		"core/optional_test.go",
		[]byte(optionalTestFile),
	)
}

func newPagerFile(coordinator *coordinator.Client, baseImportPath string) *File {
	content := replaceCoreImportPath(pagerFile, baseImportPath)
	return NewFile(
		coordinator,
		"internal/pager.go",
		[]byte(content),
	)
}

func newPageFile(coordinator *coordinator.Client) *File {
	return NewFile(
		coordinator,
		"core/page.go",
		[]byte(pageFile),
	)
}

func newStreamFile(coordinator *coordinator.Client) *File {
	return NewFile(
		coordinator,
		"core/stream.go",
		[]byte(streamFile),
	)
}

func newStreamerFile(coordinator *coordinator.Client, baseImportPath string) *File {
	content := replaceCoreImportPath(streamerFile, baseImportPath)
	return NewFile(
		coordinator,
		"internal/streamer.go",
		[]byte(content),
	)
}

func newRetrierFile(coordinator *coordinator.Client, baseImportPath string) *File {
	content := replaceCoreImportPath(retrierFile, baseImportPath)
	return NewFile(
		coordinator,
		"internal/retrier.go",
		[]byte(content),
	)
}

func newRetrierTestFile(coordinator *coordinator.Client, baseImportPath string) *File {
	content := replaceCoreImportPath(retrierTestFile, baseImportPath)
	return NewFile(
		coordinator,
		"internal/retrier_test.go",
		[]byte(content),
	)
}

func newQueryFile(coordinator *coordinator.Client) *File {
	return NewFile(
		coordinator,
		"internal/query.go",
		[]byte(queryFile),
	)
}

func newQueryTestFile(coordinator *coordinator.Client) *File {
	return NewFile(
		coordinator,
		"internal/query_test.go",
		[]byte(queryTestFile),
	)
}

func newStringerFile(coordinator *coordinator.Client) *File {
	return NewFile(
		coordinator,
		"internal/stringer.go",
		[]byte(stringerFile),
	)
}

func newTimeFile(coordinator *coordinator.Client) *File {
	return NewFile(
		coordinator,
		"internal/time.go",
		[]byte(timeFile),
	)
}

func newExtraPropertiesFile(coordinator *coordinator.Client) *File {
	return NewFile(
		coordinator,
		"internal/extra_properties.go",
		[]byte(extraPropertiesFile),
	)
}

func newExtraPropertiesTestFile(coordinator *coordinator.Client) *File {
	return NewFile(
		coordinator,
		"internal/extra_properties_test.go",
		[]byte(extraPropertiesTestFile),
	)
}

func replaceCoreImportPath(content string, baseImportPath string) string {
	return strings.Replace(
		content,
		embeddedCoreImportPath,
		filepath.Join(baseImportPath, "core"),
		1,
	)
}

type fileInfo struct {
	filename    string
	packageName string
}

func fileInfoForRequestOptionsDefinition() *fileInfo {
	return &fileInfo{
		filename:    "core/request_option.go",
		packageName: "core",
	}
}

func fileInfoForIdempotentRequestOptionsDefinition() *fileInfo {
	return &fileInfo{
		filename:    "core/idempotent_request_option.go",
		packageName: "core",
	}
}

func fileInfoForRequestOptions() *fileInfo {
	return &fileInfo{
		filename:    "option/request_option.go",
		packageName: "option",
	}
}

func fileInfoForIdempotentRequestOptions() *fileInfo {
	return &fileInfo{
		filename:    "option/idempotent_request_option.go",
		packageName: "option",
	}
}

func fileInfoForLegacyClientOptions() *fileInfo {
	return &fileInfo{
		filename:    "client/options.go",
		packageName: "client",
	}
}

func fileInfoForOptionalHelpers(rootPackageName string, generatedNames map[string]struct{}, generatedPackages map[string]struct{}) (*fileInfo, bool) {
	_, hasOptional := generatedNames["Optional"]
	_, hasNull := generatedNames["Null"]
	if hasOptional || hasNull {
		return &fileInfo{
			filename:    "core/_optional.go",
			packageName: "core",
		}, true
	}
	if _, ok := generatedPackages["optional"]; ok {
		return &fileInfo{
			filename:    "_optional.go",
			packageName: rootPackageName,
		}, false
	}
	return &fileInfo{
		filename:    "optional.go",
		packageName: rootPackageName,
	}, false
}

func fileInfoForEnvironments(rootPackageName string, generatedNames map[string]struct{}, generatedPackages map[string]struct{}) (*fileInfo, bool) {
	if _, ok := generatedNames["Environments"]; ok {
		return &fileInfo{
			filename:    "core/environments.go",
			packageName: "core",
		}, true
	}
	if _, ok := generatedPackages["environments"]; ok {
		return &fileInfo{
			filename:    "_environments.go",
			packageName: rootPackageName,
		}, false
	}
	return &fileInfo{
		filename:    "environments.go",
		packageName: rootPackageName,
	}, false
}

func fileInfoForType(rootPackageName string, fernFilepath *fernir.FernFilepath) fileInfo {
	var packages []string
	for _, packageName := range fernFilepath.PackagePath {
		packages = append(packages, strings.ToLower(packageName.CamelCase.SafeName))
	}
	basename := "types"
	if fernFilepath.File != nil {
		basename = fernFilepath.File.SnakeCase.UnsafeName
	}
	if len(packages) == 0 {
		return fileInfo{
			filename:    fmt.Sprintf("%s.go", basename),
			packageName: rootPackageName,
		}
	}
	return fileInfo{
		filename:    fmt.Sprintf("%s.go", filepath.Join(append(packages, basename)...)),
		packageName: packages[len(packages)-1],
	}
}

func fileInfoForPackageDocs(fernFilepath *fernir.FernFilepath) *fileInfo {
	packagePath := packagePathForDocs(fernFilepath)
	return &fileInfo{
		filename:    filepath.Join(append(packagePath, "doc.go")...),
		packageName: packagePath[len(packagePath)-1],
	}
}

func fileInfoForService(fernFilepath *fernir.FernFilepath) *fileInfo {
	packagePath := packagePathForClient(fernFilepath)
	return &fileInfo{
		filename:    filepath.Join(append(packagePath, "client.go")...),
		packageName: packagePath[len(packagePath)-1],
	}
}

func fileInfoForPackage(rootPackageName string, fernFilepath *fernir.FernFilepath) *fileInfo {
	var packages []string
	for _, packageName := range fernFilepath.PackagePath {
		packages = append(packages, strings.ToLower(packageName.CamelCase.SafeName))
	}
	if len(packages) == 0 {
		// This type didn't declare a package, so it belongs at the top-level.
		// The top-level package uses the API's name as its package declaration.
		return &fileInfo{
			filename:    packageDocsFilename,
			packageName: rootPackageName,
		}
	}
	return &fileInfo{
		filename:    filepath.Join(append(packages, packageDocsFilename)...),
		packageName: packages[len(packages)-1],
	}
}

func generatedNamesFromIR(ir *fernir.IntermediateRepresentation) map[string]struct{} {
	generatedNames := make(map[string]struct{})
	for _, irType := range ir.Types {
		generatedNames[irType.Name.Name.PascalCase.UnsafeName] = struct{}{}
	}
	for _, irError := range ir.Errors {
		generatedNames[irError.Name.Name.PascalCase.UnsafeName] = struct{}{}
	}
	for _, irVariable := range ir.Variables {
		generatedNames[irVariable.Name.PascalCase.UnsafeName] = struct{}{}
	}
	return generatedNames
}

// TODO: Consolidate these functions into a single collision detection type.
// The collision detection needs to be far more robust (i.e. clients generated
// in nested packages that define client types).
func generatedPackagesFromIR(ir *fernir.IntermediateRepresentation) map[string]struct{} {
	generatedPackages := make(map[string]struct{})
	for _, irService := range ir.Services {
		fernFilepath := irService.Name.FernFilepath
		if fernFilepath.File != nil {
			generatedPackages[strings.ToLower(fernFilepath.File.CamelCase.SafeName)] = struct{}{}
		}
	}
	return generatedPackages
}

// shouldSkipRequestType returns true if the request type should not be generated.
func shouldSkipRequestType(irEndpoint *fernir.HttpEndpoint, inlinePathParameters bool, inlineFileProperties bool) bool {
	if irEndpoint.SdkRequest == nil || irEndpoint.SdkRequest.Shape == nil || irEndpoint.SdkRequest.Shape.Wrapper == nil {
		// This endpoint doesn't have any in-lined request types that need to be generated.
		return true
	}
	return !needsRequestParameter(irEndpoint, inlinePathParameters, inlineFileProperties)
}

// fileUploadHasBodyProperties returns true if the file upload request has at least
// one body property.
func fileUploadHasBodyProperties(fileUpload *fernir.FileUploadRequest) bool {
	if fileUpload == nil {
		return false
	}
	// If this request is a file upload, there must be at least one body property
	// in order for us to generate the in-lined request type.
	for _, property := range fileUpload.Properties {
		if property.BodyProperty != nil {
			return true
		}
	}
	return false
}

// fileUploadHasFileProperties returns true if the file upload request has at least
// one file property.
func fileUploadHasFileProperties(fileUpload *fernir.FileUploadRequest) bool {
	if fileUpload == nil {
		return false
	}
	// If this request is a file upload, there must be at least one body property
	// in order for us to generate the in-lined request type.
	for _, property := range fileUpload.Properties {
		if property.File != nil {
			return true
		}
	}
	return false
}

func packagePathForDocs(fernFilepath *fernir.FernFilepath) []string {
	var packages []string
	for _, packageName := range fernFilepath.PackagePath {
		packages = append(packages, strings.ToLower(packageName.CamelCase.SafeName))
	}
	if fernFilepath.File == nil {
		return packages
	}
	directory := strings.ToLower(fernFilepath.File.CamelCase.SafeName)
	return append(packages, directory)
}

func packagePathForClient(fernFilepath *fernir.FernFilepath) []string {
	var packages []string
	for _, packageName := range fernFilepath.PackagePath {
		packages = append(packages, strings.ToLower(packageName.CamelCase.SafeName))
	}
	directory := "client"
	if fernFilepath.File != nil {
		directory = strings.ToLower(fernFilepath.File.CamelCase.SafeName)
	}
	return append(packages, directory)
}

type typeToGenerate struct {
	ID           string
	FernFilepath *fernir.FernFilepath

	// Exactly one of these will be non-nil.
	TypeDeclaration *fernir.TypeDeclaration
	Endpoint        *fernir.HttpEndpoint
	Service         *fernir.HttpService
}

// fileInfoToTypes consolidates all of the given types based on the file they will be generated into.
func fileInfoToTypes(
	rootPackageName string,
	irTypes map[fernir.TypeId]*fernir.TypeDeclaration,
	irServices map[fernir.ServiceId]*fernir.HttpService,
	irServiceTypeReferenceInfo *fernir.ServiceTypeReferenceInfo,
	inlinePathParameters bool,
	inlineFileProperties bool,
) (map[fileInfo][]*typeToGenerate, error) {
	result := make(map[fileInfo][]*typeToGenerate)
	for _, irService := range irServices {
		for _, irEndpoint := range irService.Endpoints {
			if shouldSkipRequestType(irEndpoint, inlinePathParameters, inlineFileProperties) {
				continue
			}
			fileInfo := fileInfoForType(rootPackageName, irService.Name.FernFilepath)
			result[fileInfo] = append(
				result[fileInfo],
				&typeToGenerate{
					ID:           irEndpoint.Name.OriginalName,
					FernFilepath: irService.Name.FernFilepath,
					Endpoint:     irEndpoint,
					Service:      irService,
				},
			)
		}
	}
	if irServiceTypeReferenceInfo == nil {
		// If the service type reference info isn't provided, default
		// to the file-per-type naming convention.
		for _, irType := range irTypes {
			fileInfo := fileInfoForType(rootPackageName, irType.Name.FernFilepath)
			result[fileInfo] = append(
				result[fileInfo],
				&typeToGenerate{
					ID:              irType.Name.TypeId,
					FernFilepath:    irType.Name.FernFilepath,
					TypeDeclaration: irType,
				},
			)
		}
	} else {
		sharedTypes := irServiceTypeReferenceInfo.SharedTypes
		if typeIds, ok := irServiceTypeReferenceInfo.TypesReferencedOnlyByService["service_"]; ok {
			// The root service types should be included alongside the other shared types.
			sharedTypes = append(sharedTypes, typeIds...)
		}
		for _, typeId := range sharedTypes {
			typeDeclaration, ok := irTypes[typeId]
			if !ok {
				// Should be unreachable.
				return nil, fmt.Errorf("IR ServiceTypeReferenceInfo referenced type %q which doesn't exist", typeId)
			}
			fileInfo := fileInfoForType(rootPackageName, typeDeclaration.Name.FernFilepath)
			if isReservedFilename(filepath.Base(fileInfo.filename)) {
				fileInfo.filename = filepath.Join(filepath.Dir(fileInfo.filename), sharedTypesFilename)
			}
			result[fileInfo] = append(
				result[fileInfo],
				&typeToGenerate{
					ID:              typeDeclaration.Name.TypeId,
					FernFilepath:    typeDeclaration.Name.FernFilepath,
					TypeDeclaration: typeDeclaration,
				},
			)
		}
		for serviceId, typeIds := range irServiceTypeReferenceInfo.TypesReferencedOnlyByService {
			if serviceId == "service_" {
				// The root service requires special handling.
				continue
			}
			service, ok := irServices[serviceId]
			if !ok {
				// Should be unreachable.
				return nil, fmt.Errorf("IR ServiceTypeReferenceInfo referenced service %q which doesn't exist", serviceId)
			}
			for _, typeId := range typeIds {
				typeDeclaration, ok := irTypes[typeId]
				if !ok {
					// Should be unreachable.
					return nil, fmt.Errorf("IR ServiceTypeReferenceInfo referenced type %q which doesn't exist", typeId)
				}
				fileInfo := fileInfoForType(rootPackageName, typeDeclaration.Name.FernFilepath)
				if shouldSetFileInfoToMatchService(typeDeclaration.Name.FernFilepath, service.Name.FernFilepath) {
					fileInfo.filename = filepath.Join(filepath.Dir(fileInfo.filename), service.Name.FernFilepath.File.SnakeCase.UnsafeName+".go")
				}
				result[fileInfo] = append(
					result[fileInfo],
					&typeToGenerate{
						ID:              typeDeclaration.Name.TypeId,
						FernFilepath:    typeDeclaration.Name.FernFilepath,
						TypeDeclaration: typeDeclaration,
					},
				)
			}
		}
	}
	// Sort the results so that we have deterministic behavior.
	for fileInfo := range result {
		sort.Slice(result[fileInfo], func(i, j int) bool { return result[fileInfo][i].ID < result[fileInfo][j].ID })
	}
	return result, nil
}

func shouldSetFileInfoToMatchService(
	typeFernFilepath *fernir.FernFilepath,
	serviceFernFilepath *fernir.FernFilepath,
) bool {
	if serviceFernFilepath.File == nil || typeFernFilepath.File != nil {
		// If the service is a root client or the type is already defined
		// in a particular non-root package, we can leave it as-is.
		return false
	}
	if !packagePathIsEqual(typeFernFilepath, serviceFernFilepath) {
		// We only want to set the file info if the type is defined in the
		// same package as the service.
		return false
	}
	filename := serviceFernFilepath.File.SnakeCase.UnsafeName
	return !isReservedFilename(filename)
}

func packagePathIsEqual(a, b *fernir.FernFilepath) bool {
	if len(a.PackagePath) != len(b.PackagePath) {
		return false
	}
	for i := range a.PackagePath {
		if a.PackagePath[i].CamelCase.SafeName != b.PackagePath[i].CamelCase.SafeName {
			return false
		}
	}
	return true
}

func fileInfoToErrors(
	rootPackageName string,
	irErrorDeclarations map[fernir.ErrorId]*fernir.ErrorDeclaration,
) map[fileInfo][]*fernir.ErrorDeclaration {
	result := make(map[fileInfo][]*fernir.ErrorDeclaration)
	for _, irErrorDeclaration := range irErrorDeclarations {
		var elements []string
		for _, packageName := range irErrorDeclaration.Name.FernFilepath.PackagePath {
			elements = append(elements, strings.ToLower(packageName.CamelCase.SafeName))
		}
		fileInfo := fileInfo{
			filename:    "errors.go",
			packageName: rootPackageName,
		}
		if len(elements) > 0 {
			fileInfo.filename = filepath.Join(append(elements, fileInfo.filename)...)
			fileInfo.packageName = elements[len(elements)-1]
		}
		result[fileInfo] = append(result[fileInfo], irErrorDeclaration)
	}
	// Sort the results so that we have deterministic behavior.
	for fileInfo := range result {
		sort.Slice(result[fileInfo], func(i, j int) bool { return result[fileInfo][i].Name.ErrorId < result[fileInfo][j].Name.ErrorId })
	}
	return result
}

func stringSetToSortedSlice(set map[string]struct{}) []string {
	sorted := make([]string, 0, len(set))
	for s := range set {
		sorted = append(sorted, s)
	}
	sort.Slice(sorted, func(i, j int) bool { return sorted[i] < sorted[j] })
	return sorted
}

// zeroValueForTypeReference returns the zero value for the given type reference.
func zeroValueForTypeReference(typeReference *fernir.TypeReference, types map[ir.TypeId]*ir.TypeDeclaration) string {
	if typeReference.Container != nil && typeReference.Container.Literal != nil {
		return zeroValueForLiteral(typeReference.Container.Literal)
	}
	if typeReference.Primitive != nil {
		return zeroValueForPrimitive(typeReference.Primitive.V1)
	}
	if typeReference.Named != nil {
		typeDeclaration := types[typeReference.Named.TypeId]
		if typeDeclaration.Shape.Alias != nil {
			return zeroValueForTypeReference(typeDeclaration.Shape.Alias.AliasOf, types)
		}
		if typeDeclaration.Shape.Enum != nil {
			return `""`
		}
	}
	return "nil"
}

func zeroValueForLiteral(literal *fernir.Literal) string {
	switch literal.Type {
	case "string":
		return `""`
	case "boolean":
		return "false"
	}
	return "nil"
}

func zeroValueForPrimitive(primitive fernir.PrimitiveTypeV1) string {
	switch primitive {
	case fernir.PrimitiveTypeV1String, fernir.PrimitiveTypeV1BigInteger:
		return `""`
	case fernir.PrimitiveTypeV1Integer, fernir.PrimitiveTypeV1Long, fernir.PrimitiveTypeV1Uint, fernir.PrimitiveTypeV1Uint64, fernir.PrimitiveTypeV1Float, fernir.PrimitiveTypeV1Double:
		return "0"
	case fernir.PrimitiveTypeV1Boolean:
		return "false"
	case fernir.PrimitiveTypeV1DateTime, fernir.PrimitiveTypeV1Date:
		return "time.Time{}"
	case fernir.PrimitiveTypeV1Uuid:
		return "uuid.Nil"
	case fernir.PrimitiveTypeV1Base64:
		return "nil"
	}
	return "nil"
}

// getRootPackageName returns the generated root package name, using the API name if
// an override is not explicitly provided.
func getRootPackageName(ir *fernir.IntermediateRepresentation, packageNameOverride string) string {
	if packageNameOverride != "" {
		return packageNameOverride
	}
	return strings.ToLower(ir.ApiName.CamelCase.SafeName)
}

// getExportedClientName returns the exported client name. This is configurable so that
// users can customize how snippets are rendered, but it has no impact on the generated code.
func getExportedClientName(ir *fernir.IntermediateRepresentation, exportedClientNameOverride string) string {
	if exportedClientNameOverride != "" {
		return exportedClientNameOverride
	}
	return defaultExportedClientName
}

// generatorexecEndpointSnippetToString returns the string representation of the given
// endpoint snippet.
//
// It isn't enough to sort based on the endpoint path and method along (there can be duplicates),
// so we include the snippet's content to disambiguate.
func generatorexecEndpointSnippetToString(endpointSnippet *generatorexec.Endpoint) string {
	if endpointSnippet == nil || endpointSnippet.Id == nil {
		return ""
	}
	var goSnippet string
	if endpointSnippet.Snippet != nil && endpointSnippet.Snippet.Go != nil {
		goSnippet = endpointSnippet.Snippet.Go.Client
	}
	return fmt.Sprintf(
		"%s.%s.%s",
		endpointSnippet.Id.Path,
		endpointSnippet.Id.Method,
		goSnippet,
	)
}

// needsPaginationHelpers returns true if at least endpoint specifies pagination.
func needsPaginationHelpers(ir *fernir.IntermediateRepresentation) bool {
	for _, irService := range ir.Services {
		for _, irEndpoint := range irService.Endpoints {
			if irEndpoint.Pagination != nil {
				return true
			}
		}
	}
	return false
}

// needsFileUploadHelpers returns true if at least endpoint specifies a file upload.
func needsFileUploadHelpers(ir *fernir.IntermediateRepresentation) bool {
	for _, irService := range ir.Services {
		for _, irEndpoint := range irService.Endpoints {
			if irEndpoint.RequestBody != nil && irEndpoint.RequestBody.FileUpload != nil {
				return true
			}
		}
	}
	return false
}

func isReservedFilename(filename string) bool {
	_, ok := reservedFilenames[filename]
	return ok
}

var reservedFilenames = map[string]struct{}{
	"environments.go": struct{}{},
	"errors.go":       struct{}{},
	"file_param.go":   struct{}{},
	"optional.go":     struct{}{},
	"pointer.go":      struct{}{},
}

// pointerFunctionNames enumerates all of the pointer function names.
var pointerFunctionNames = map[string]struct{}{
	"Bool":       struct{}{},
	"Byte":       struct{}{},
	"Complex64":  struct{}{},
	"Complex128": struct{}{},
	"Float32":    struct{}{},
	"Float64":    struct{}{},
	"Int":        struct{}{},
	"Int8":       struct{}{},
	"Int16":      struct{}{},
	"Int32":      struct{}{},
	"Int64":      struct{}{},
	"Rune":       struct{}{},
	"String":     struct{}{},
	"Uint":       struct{}{},
	"Uint8":      struct{}{},
	"Uint16":     struct{}{},
	"Uint32":     struct{}{},
	"Uint64":     struct{}{},
	"Uintptr":    struct{}{},
	"Time":       struct{}{},
	// TODO: Add support for BigInteger.
}

// valueOf dereferences the given value, or returns the zero value if nil.
func valueOf[T any](value *T) T {
	var result T
	if value == nil {
		return result
	}
	return *value
}
