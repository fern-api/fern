package generator

import (
	_ "embed"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/fern-api/fern-go/internal/fern/ir"
	fernir "github.com/fern-api/fern-go/internal/fern/ir"
)

const (
	// packageDocsFilename represents the standard package documentation filename.
	packageDocsFilename = "doc.go"

	// licenseFilename is the generated license filename.
	licenseFilename = "LICENSE"
)

//go:embed license/MIT.md
var licenseMIT string

// Mode is an enum for different generator modes (i.e. types, client, etc).
type Mode uint8

const (
	ModeModel = iota + 1
	ModeClient
)

// Generator represents the Go code generator.
type Generator struct {
	config *Config
}

// File is a generated file.
type File struct {
	Path    string
	Content []byte
}

// New returns a new *Generator.
func New(config *Config) (*Generator, error) {
	return &Generator{
		config: config,
	}, nil
}

// GenerateTypes runs the code generation process.
func (g *Generator) Generate(mode Mode) ([]*File, error) {
	ir, err := readIR(g.config.IRFilepath)
	if err != nil {
		return nil, err
	}
	return g.generate(ir, mode)
}

func (g *Generator) generate(ir *fernir.IntermediateRepresentation, mode Mode) ([]*File, error) {
	if g.config.ImportPath == "" {
		// If an import path is not configured, we need to validate that none of types
		// import types from another package.
		for _, typeDeclaration := range ir.Types {
			typeImportPath := fernFilepathToImportPath(g.config.ImportPath, typeDeclaration.Name.FernFilepath)
			for _, referencedType := range typeDeclaration.ReferencedTypes {
				referencedImportPath := fernFilepathToImportPath(g.config.ImportPath, referencedType.FernFilepath)
				if typeImportPath != referencedImportPath {
					return nil, fmt.Errorf(
						"%s referneces %s from another package, but a generator import path was not specified",
						typeDeclaration.Name.TypeId,
						referencedType.TypeId,
					)
				}
			}
		}
	}
	var files []*File
	// First write all of the package-level documentation, if any (i.e. in a doc.go file).
	if ir.RootPackage != nil && ir.RootPackage.Docs != nil && len(*ir.RootPackage.Docs) > 0 {
		fileInfo := fileInfoForPackage(ir.ApiName, ir.RootPackage.FernFilepath)
		writer := newFileWriter(fileInfo.filename, fileInfo.packageName, "", nil, nil)
		writer.WriteDocs(ir.RootPackage.Docs)
		files = append(files, writer.DocsFile())
	}
	for _, subpackage := range ir.Subpackages {
		if subpackage.Docs == nil || len(*subpackage.Docs) == 0 {
			continue
		}
		fileInfo := fileInfoForPackage(ir.ApiName, subpackage.FernFilepath)
		writer := newFileWriter(fileInfo.filename, fileInfo.packageName, "", nil, nil)
		writer.WriteDocs(subpackage.Docs)
		files = append(files, writer.DocsFile())
	}
	for _, irType := range ir.Types {
		fileInfo := fileInfoForType(ir.ApiName, irType.Name.FernFilepath, irType.Name.Name)
		writer := newFileWriter(
			fileInfo.filename,
			fileInfo.packageName,
			g.config.ImportPath,
			ir.Types,
			ir.Errors,
		)
		if err := writer.WriteType(irType); err != nil {
			return nil, err
		}
		file, err := writer.File()
		if err != nil {
			return nil, err
		}
		files = append(files, file)
	}
	switch mode {
	case ModeClient:
		if g.config.ImportPath == "" {
			return nil, errors.New("the SDK requires an import path configuration")
		}
		// TODO: Temporary silent failure to integrate with fiddle - uncomment these lines and return an error here.
		//if ir.ErrorDiscriminationStrategy != nil && ir.ErrorDiscriminationStrategy.StatusCode == nil {
		//return nil, errors.New("this generator only supports the status-code error discrimination strategy")
		//}
		// Generate the core API files.
		fileInfo := fileInfoForCoreClientOptions()
		writer := newFileWriter(
			fileInfo.filename,
			fileInfo.packageName,
			g.config.ImportPath,
			ir.Types,
			ir.Errors,
		)
		if err := writer.WriteCoreClientOptions(ir.Auth); err != nil {
			return nil, err
		}
		file, err := writer.File()
		if err != nil {
			return nil, err
		}
		files = append(files, file)
		if ir.Environments != nil {
			// Generate the core environments file.
			fileInfo = fileInfoForEnvironments()
			writer = newFileWriter(
				fileInfo.filename,
				fileInfo.packageName,
				g.config.ImportPath,
				ir.Types,
				ir.Errors,
			)
			if err := writer.WriteEnvironments(ir.Environments); err != nil {
				return nil, err
			}
			file, err = writer.File()
			if err != nil {
				return nil, err
			}
			files = append(files, file)
		}
		files = append(files, newCoreFile())
		files = append(files, newPointerFile(ir))
		// Generate the error types, if any.
		for _, irError := range ir.Errors {
			fileInfo := fileInfoForType(ir.ApiName, irError.Name.FernFilepath, irError.Name.Name)
			writer := newFileWriter(
				fileInfo.filename,
				fileInfo.packageName,
				g.config.ImportPath,
				ir.Types,
				ir.Errors,
			)
			if err := writer.WriteError(irError); err != nil {
				return nil, err
			}
			file, err := writer.File()
			if err != nil {
				return nil, err
			}
			files = append(files, file)
		}
		// First generate the client at the root package, if any.
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
				serviceFiles, err := g.generateService(ir, ir.Services[*ir.RootPackage.Service], rootSubpackages)
				if err != nil {
					return nil, err
				}
				files = append(files, serviceFiles...)
			} else {
				serviceFile, err := g.generateRootServiceWithoutEndpoints(ir, ir.RootPackage.FernFilepath, rootSubpackages)
				if err != nil {
					return nil, err
				}
				files = append(files, serviceFile)
			}
		}
		// Then generate the client for all of the subpackages.
		for _, irSubpackage := range ir.Subpackages {
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
				serviceFile, err := g.generateServiceWithoutEndpoints(ir, irSubpackage, subpackages)
				if err != nil {
					return nil, err
				}
				files = append(files, serviceFile)
				continue
			}
			// This service has endpoints, so we proceed with the normal flow.
			serviceFiles, err := g.generateService(ir, ir.Services[*irSubpackage.Service], subpackages)
			if err != nil {
				return nil, err
			}
			files = append(files, serviceFiles...)
		}
	}
	// Finally, generate the go.mod file, if needed.
	//
	// The go.sum file will be generated after the
	// go.mod file is written to disk.
	if g.config.ModuleConfig != nil {
		file, err := NewModFile(g.config.ModuleConfig)
		if err != nil {
			return nil, err
		}
		files = append(files, file)

		// If a go.mod was generated, we treat the result
		// as a packaged SDK, so we also write a license
		// file.
		//
		// Note that the license file is required to support
		// Go's package docs (re: https://pkg.go.dev/license-policy).
		files = append(files, newLicenseFile())
	}
	return files, nil
}

func (g *Generator) generateService(
	ir *fernir.IntermediateRepresentation,
	irService *fernir.HttpService,
	irSubpackages []*fernir.Subpackage,
) ([]*File, error) {
	var files []*File
	// Generate the in-lined request types.
	for _, irEndpoint := range irService.Endpoints {
		if irEndpoint.SdkRequest == nil || irEndpoint.SdkRequest.Shape == nil || irEndpoint.SdkRequest.Shape.Wrapper == nil {
			// This endpoint doesn't have any in-lined request types that need to be generated.
			continue
		}
		fileInfo := fileInfoForType(ir.ApiName, irService.Name.FernFilepath, irEndpoint.SdkRequest.Shape.Wrapper.WrapperName)
		writer := newFileWriter(
			fileInfo.filename,
			fileInfo.packageName,
			g.config.ImportPath,
			ir.Types,
			ir.Errors,
		)
		if err := writer.WriteRequestType(irService.Name.FernFilepath, irEndpoint); err != nil {
			return nil, err
		}
		file, err := writer.File()
		if err != nil {
			return nil, err
		}
		files = append(files, file)
	}
	// Generate the client interface.
	var namePrefix *fernir.Name
	// TODO: Temporary solution - refactor this so we more accurately
	// recognize whether or not the leaf is defined by a __package__.yml
	// or a filename.
	if irService.Name.FernFilepath.File != nil {
		namePrefix = irService.Name.FernFilepath.File
	}
	fileInfo := fileInfoForService(ir.ApiName, irService.Name.FernFilepath, namePrefix)
	writer := newFileWriter(
		fileInfo.filename,
		fileInfo.packageName,
		g.config.ImportPath,
		ir.Types,
		ir.Errors,
	)
	if err := writer.WriteClient(
		irService.Endpoints,
		irSubpackages,
		ir.Environments,
		irService.Name.FernFilepath,
		namePrefix,
	); err != nil {
		return nil, err
	}
	file, err := writer.File()
	if err != nil {
		return nil, err
	}
	files = append(files, file)
	return files, nil
}

// generateServiceWithoutEndpoints is behaviorally similar to g.generateService, but
// it's suited to write purely intermediary services (i.e. those that don't include
// any endpoints).
func (g *Generator) generateServiceWithoutEndpoints(
	ir *fernir.IntermediateRepresentation,
	irSubpackage *fernir.Subpackage,
	irSubpackages []*fernir.Subpackage,
) (*File, error) {
	var namePrefix *fernir.Name
	if len(irSubpackages) > 0 {
		// TODO: Temporary solution - refactor this so we more accurately
		// recognize whether or not the leaf is defined by a __package__.yml
		// or a filename.
		//
		// When refactored, consolidate the nested conditional into a single condition.
		if irSubpackage.FernFilepath.File != nil {
			namePrefix = irSubpackage.FernFilepath.File
		}
	}
	fileInfo := fileInfoForService(ir.ApiName, irSubpackage.FernFilepath, namePrefix)
	writer := newFileWriter(
		fileInfo.filename,
		fileInfo.packageName,
		g.config.ImportPath,
		ir.Types,
		ir.Errors,
	)
	if err := writer.WriteClient(
		nil,
		irSubpackages,
		nil,
		irSubpackage.FernFilepath,
		namePrefix,
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
) (*File, error) {
	fileInfo := fileInfoForService(ir.ApiName, fernFilepath, nil /* namePrefix */)
	writer := newFileWriter(
		fileInfo.filename,
		fileInfo.packageName,
		g.config.ImportPath,
		ir.Types,
		ir.Errors,
	)
	if err := writer.WriteClient(
		nil,
		irSubpackages,
		nil,
		fernFilepath,
		nil,
	); err != nil {
		return nil, err
	}
	return writer.File()
}

// newLicenseFile returns a *File for the generated LICENSE file.
// For now, this is always the MIT license.
//
// Note that this is a temporary solution - ideally this integration
// exists outside of the generator and is handled at the layer above.
func newLicenseFile() *File {
	return &File{
		Path:    licenseFilename,
		Content: []byte(licenseMIT),
	}
}

// readIR reads the *InermediateRepresentation from the given filename.
func readIR(irFilename string) (*ir.IntermediateRepresentation, error) {
	bytes, err := os.ReadFile(irFilename)
	if err != nil {
		return nil, fmt.Errorf("failed to read intermediate representation: %v", err)
	}
	ir := new(ir.IntermediateRepresentation)
	if err := json.Unmarshal(bytes, ir); err != nil {
		return nil, fmt.Errorf("failed to unmarshal intermediate representation: %v", err)
	}
	return ir, nil
}

// newPointerFile returns a *File containing the pointer helper functions
// used to more easily instantiate pointers to primitive values (e.g. *string).
//
// In general, this file is deposited at the root of the SDK so that users can
// access the helpers alongside the rest of the top-level definitions. However,
// if any naming conflict exists between the generated types, this file is
// deposited in the core package.
func newPointerFile(ir *ir.IntermediateRepresentation) *File {
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
		return &File{
			Path:    "core/pointer.go",
			Content: []byte(pointerFile),
		}
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
		fmt.Sprintf("package %s", strings.ToLower(ir.ApiName.CamelCase.SafeName)),
		1,
	)
	return &File{
		Path:    filename,
		Content: []byte(content),
	}
}

func newCoreFile() *File {
	return &File{
		Path:    "core/core.go",
		Content: []byte(coreFile),
	}
}

type fileInfo struct {
	filename    string
	packageName string
}

func fileInfoForCoreClientOptions() *fileInfo {
	return &fileInfo{
		filename:    "core/client_option.go",
		packageName: "core",
	}
}

func fileInfoForEnvironments() *fileInfo {
	return &fileInfo{
		filename:    "core/environments.go",
		packageName: "core",
	}
}

func fileInfoForType(apiName *ir.Name, fernFilepath *ir.FernFilepath, name *ir.Name) *fileInfo {
	var packages []string
	for _, packageName := range fernFilepath.PackagePath {
		packages = append(packages, strings.ToLower(packageName.CamelCase.SafeName))
	}
	typeName := name.SnakeCase.UnsafeName
	if len(packages) == 0 {
		// This type didn't declare a package, so it belongs at the top-level.
		// The top-level package uses the API's name as its package declaration.
		return &fileInfo{
			filename:    fmt.Sprintf("%s.go", typeName),
			packageName: strings.ToLower(apiName.CamelCase.SafeName),
		}
	}
	return &fileInfo{
		filename:    fmt.Sprintf("%s.go", filepath.Join(append(packages, typeName)...)),
		packageName: packages[len(packages)-1],
	}
}

func fileInfoForEndpoint(apiName *ir.Name, fernFilepath *ir.FernFilepath, name *ir.Name) *fileInfo {
	var packages []string
	for _, packageName := range fernFilepath.PackagePath {
		packages = append(packages, strings.ToLower(packageName.CamelCase.SafeName))
	}
	typeName := name.SnakeCase.UnsafeName
	if len(packages) == 0 {
		// This type didn't declare a package, so it belongs at the top-level.
		// The top-level package uses the API's name as its package declaration.
		return &fileInfo{
			filename:    fmt.Sprintf("%s_endpoint.go", typeName),
			packageName: strings.ToLower(apiName.CamelCase.SafeName),
		}
	}
	return &fileInfo{
		filename:    fmt.Sprintf("%s_endpoint.go", filepath.Join(append(packages, typeName)...)),
		packageName: packages[len(packages)-1],
	}
}

func fileInfoForService(apiName *ir.Name, fernFilepath *ir.FernFilepath, name *ir.Name) *fileInfo {
	var packages []string
	for _, packageName := range fernFilepath.PackagePath {
		packages = append(packages, strings.ToLower(packageName.CamelCase.SafeName))
	}
	basename := "client.go"
	if name != nil {
		// Prepend the name, if any. This lets us create a prefixed client in
		// the same package to maintain the package hierarchy (e.g. user_service.go).
		basename = name.SnakeCase.UnsafeName + "_" + basename
	}
	if len(packages) == 0 {
		// This type didn't declare a package, so it belongs at the top-level.
		// The top-level package uses the API's name as its package declaration.
		return &fileInfo{
			filename:    basename,
			packageName: strings.ToLower(apiName.CamelCase.SafeName),
		}
	}
	return &fileInfo{
		filename:    filepath.Join(append(packages, basename)...),
		packageName: packages[len(packages)-1],
	}
}

func fileInfoForPackage(apiName *ir.Name, fernFilepath *ir.FernFilepath) *fileInfo {
	var packages []string
	for _, packageName := range fernFilepath.PackagePath {
		packages = append(packages, strings.ToLower(packageName.CamelCase.SafeName))
	}
	if len(packages) == 0 {
		// This type didn't declare a package, so it belongs at the top-level.
		// The top-level package uses the API's name as its package declaration.
		return &fileInfo{
			filename:    packageDocsFilename,
			packageName: strings.ToLower(apiName.CamelCase.SafeName),
		}
	}
	return &fileInfo{
		filename:    filepath.Join(append(packages, packageDocsFilename)...),
		packageName: packages[len(packages)-1],
	}
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
}
