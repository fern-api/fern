package generator

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/fern-api/fern-go/internal/coordinator"
	"github.com/fern-api/fern-go/internal/fern/generatorexec"
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
	config      *Config
	coordinator *coordinator.Client
}

// File is a generated file.
type File struct {
	Path    string
	Content []byte
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
	// First determine what types will be generated so that we can determine whether or not there will
	// be any conflicts.
	var (
		generatedNames    = generatedNamesFromIR(ir)
		generatedPackages = generatedPackagesFromIR(ir)
	)
	var files []*File
	// First write all of the package-level documentation, if any (i.e. in a doc.go file).
	if ir.RootPackage != nil && ir.RootPackage.Docs != nil && len(*ir.RootPackage.Docs) > 0 {
		fileInfo := fileInfoForPackage(ir.ApiName, ir.RootPackage.FernFilepath)
		writer := newFileWriter(fileInfo.filename, fileInfo.packageName, "", nil, nil, g.coordinator)
		writer.WriteDocs(ir.RootPackage.Docs)
		files = append(files, writer.DocsFile())
	}
	for _, subpackage := range ir.Subpackages {
		if subpackage.Docs == nil || len(*subpackage.Docs) == 0 {
			continue
		}
		fileInfo := fileInfoForPackage(ir.ApiName, subpackage.FernFilepath)
		writer := newFileWriter(fileInfo.filename, fileInfo.packageName, "", nil, nil, g.coordinator)
		writer.WriteDocs(subpackage.Docs)
		files = append(files, writer.DocsFile())
	}
	// Then split up all the types based on the Fern directory they belong to (i.e. the root package,
	// or some other subpackage).
	fileInfoToTypes, err := fileInfoToTypes(ir.ApiName, ir.Types, ir.Services, ir.ServiceTypeReferenceInfo)
	if err != nil {
		return nil, err
	}
	for fileInfo, typesToGenerate := range fileInfoToTypes {
		writer := newFileWriter(
			fileInfo.filename,
			fileInfo.packageName,
			g.config.ImportPath,
			ir.Types,
			ir.Errors,
			g.coordinator,
		)
		for _, typeToGenerate := range typesToGenerate {
			switch {
			case typeToGenerate.TypeDeclaration != nil:
				if err := writer.WriteType(typeToGenerate.TypeDeclaration); err != nil {
					return nil, err
				}
			case typeToGenerate.Endpoint != nil:
				if err := writer.WriteRequestType(typeToGenerate.FernFilepath, typeToGenerate.Endpoint); err != nil {
					return nil, err
				}
			}
		}
		file, err := writer.File()
		if err != nil {
			return nil, err
		}
		files = append(files, file)
	}
	switch mode {
	case ModeClient:
		// Generate the core API files.
		fileInfo := fileInfoForClientOptionsDefinition()
		writer := newFileWriter(
			fileInfo.filename,
			fileInfo.packageName,
			g.config.ImportPath,
			ir.Types,
			ir.Errors,
			g.coordinator,
		)
		if err := writer.WriteClientOptionsDefinition(ir.Auth, ir.Headers); err != nil {
			return nil, err
		}
		file, err := writer.File()
		if err != nil {
			return nil, err
		}
		files = append(files, file)
		if ir.Environments != nil {
			// Generate the core environments file.
			fileInfo = fileInfoForEnvironments(ir.ApiName, generatedNames, generatedPackages)
			writer = newFileWriter(
				fileInfo.filename,
				fileInfo.packageName,
				g.config.ImportPath,
				ir.Types,
				ir.Errors,
				g.coordinator,
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
		// Generate the client options.
		fileInfo = fileInfoForClientOptions(ir.ApiName, generatedNames)
		writer = newFileWriter(
			fileInfo.filename,
			fileInfo.packageName,
			g.config.ImportPath,
			ir.Types,
			ir.Errors,
			g.coordinator,
		)
		if err := writer.WriteClientOptions(ir.Auth, ir.Headers); err != nil {
			return nil, err
		}
		file, err = writer.File()
		if err != nil {
			return nil, err
		}
		files = append(files, file)
		files = append(files, newCoreFile(g.coordinator))
		files = append(files, newCoreTestFile(g.coordinator))
		files = append(files, newPointerFile(g.coordinator, ir.ApiName, generatedNames))

		// Generate the error types, if any.
		for fileInfo, irErrors := range fileInfoToErrors(ir.ApiName, ir.Errors) {
			writer := newFileWriter(
				fileInfo.filename,
				fileInfo.packageName,
				g.config.ImportPath,
				ir.Types,
				ir.Errors,
				g.coordinator,
			)
			// TODO: We need to sort these for deterministic results.
			// Do this based on the ErrorId.
			for _, irError := range irErrors {
				if err := writer.WriteError(irError); err != nil {
					return nil, err
				}
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
		files = append(files, newLicenseFile(g.coordinator))
	}
	return files, nil
}

func (g *Generator) generateService(
	ir *fernir.IntermediateRepresentation,
	irService *fernir.HttpService,
	irSubpackages []*fernir.Subpackage,
) ([]*File, error) {
	var files []*File
	fileInfo := fileInfoForService(irService.Name.FernFilepath)
	writer := newFileWriter(
		fileInfo.filename,
		fileInfo.packageName,
		g.config.ImportPath,
		ir.Types,
		ir.Errors,
		g.coordinator,
	)
	if err := writer.WriteClient(
		irService.Endpoints,
		irSubpackages,
		ir.Environments,
		ir.ErrorDiscriminationStrategy,
		irService.Name.FernFilepath,
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
	fileInfo := fileInfoForService(irSubpackage.FernFilepath)
	writer := newFileWriter(
		fileInfo.filename,
		fileInfo.packageName,
		g.config.ImportPath,
		ir.Types,
		ir.Errors,
		g.coordinator,
	)
	if err := writer.WriteClient(
		nil,
		irSubpackages,
		nil,
		ir.ErrorDiscriminationStrategy,
		irSubpackage.FernFilepath,
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
	fileInfo := fileInfoForService(fernFilepath)
	writer := newFileWriter(
		fileInfo.filename,
		fileInfo.packageName,
		g.config.ImportPath,
		ir.Types,
		ir.Errors,
		g.coordinator,
	)
	if err := writer.WriteClient(
		nil,
		irSubpackages,
		nil,
		ir.ErrorDiscriminationStrategy,
		fernFilepath,
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
func newLicenseFile(coordinator *coordinator.Client) *File {
	return NewFile(
		coordinator,
		licenseFilename,
		[]byte(licenseMIT),
	)
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
func newPointerFile(coordinator *coordinator.Client, apiName *ir.Name, generatedNames map[string]struct{}) *File {
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
		fmt.Sprintf("package %s", strings.ToLower(apiName.CamelCase.SafeName)),
		1,
	)
	return NewFile(
		coordinator,
		filename,
		[]byte(content),
	)
}

func newCoreFile(coordinator *coordinator.Client) *File {
	return NewFile(
		coordinator,
		"core/core.go",
		[]byte(coreFile),
	)
}

func newCoreTestFile(coordinator *coordinator.Client) *File {
	return NewFile(
		coordinator,
		"core/core_test.go",
		[]byte(coreTestFile),
	)
}

type fileInfo struct {
	filename    string
	packageName string
}

func fileInfoForClientOptionsDefinition() *fileInfo {
	return &fileInfo{
		filename:    "core/client_option.go",
		packageName: "core",
	}
}

// TODO: We need to guard against the case when the user defines a client.yml file.
func fileInfoForClientOptions(apiName *ir.Name, generatedNames map[string]struct{}) *fileInfo {
	return &fileInfo{
		filename:    "client/options.go",
		packageName: "client",
	}
}

// fileInfoForCoreClientOptions is used when the client options need to be generated in
// the core package.
func fileInfoForCoreClientOptions() *fileInfo {
	return &fileInfo{
		filename:    "core/client_options.go",
		packageName: "core",
	}
}

func fileInfoForEnvironments(apiName *ir.Name, generatedNames map[string]struct{}, generatedPackages map[string]struct{}) *fileInfo {
	if _, ok := generatedNames["Environments"]; ok {
		return &fileInfo{
			filename:    "core/environments.go",
			packageName: "core",
		}
	}
	if _, ok := generatedPackages["environments"]; ok {
		return &fileInfo{
			filename:    "_environments.go",
			packageName: strings.ToLower(apiName.CamelCase.SafeName),
		}
	}
	return &fileInfo{
		filename:    "environments.go",
		packageName: strings.ToLower(apiName.CamelCase.SafeName),
	}
}

func fileInfoForType(apiName *ir.Name, fernFilepath *ir.FernFilepath) fileInfo {
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
			packageName: strings.ToLower(apiName.CamelCase.SafeName),
		}
	}
	return fileInfo{
		filename:    fmt.Sprintf("%s.go", filepath.Join(append(packages, basename)...)),
		packageName: packages[len(packages)-1],
	}
}

func fileInfoForService(fernFilepath *ir.FernFilepath) *fileInfo {
	packagePath := packagePathForClient(fernFilepath)
	return &fileInfo{
		filename:    filepath.Join(append(packagePath, "client.go")...),
		packageName: packagePath[len(packagePath)-1],
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

func generatedNamesFromIR(ir *ir.IntermediateRepresentation) map[string]struct{} {
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
func generatedPackagesFromIR(ir *ir.IntermediateRepresentation) map[string]struct{} {
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
func shouldSkipRequestType(irEndpoint *ir.HttpEndpoint) bool {
	if irEndpoint.SdkRequest == nil || irEndpoint.SdkRequest.Shape == nil || irEndpoint.SdkRequest.Shape.Wrapper == nil {
		// This endpoint doesn't have any in-lined request types that need to be generated.
		return true
	}
	if irEndpoint.RequestBody != nil && irEndpoint.RequestBody.FileUpload != nil {
		return !fileUploadHasBodyProperties(irEndpoint.RequestBody.FileUpload)
	}
	return false
}

// fileUploadHasBodyProperties returns true if the file upload request has at least
// one body property.
func fileUploadHasBodyProperties(fileUpload *ir.FileUploadRequest) bool {
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
}

// fileInfoToTypes consolidates all of the given types based on the file they will be generated into.
func fileInfoToTypes(
	apiName *fernir.Name,
	irTypes map[fernir.TypeId]*fernir.TypeDeclaration,
	irServices map[fernir.ServiceId]*fernir.HttpService,
	irServiceTypeReferenceInfo *fernir.ServiceTypeReferenceInfo,
) (map[fileInfo][]*typeToGenerate, error) {
	result := make(map[fileInfo][]*typeToGenerate)
	for _, irService := range irServices {
		for _, irEndpoint := range irService.Endpoints {
			if shouldSkipRequestType(irEndpoint) {
				continue
			}
			fileInfo := fileInfoForType(apiName, irService.Name.FernFilepath)
			result[fileInfo] = append(result[fileInfo], &typeToGenerate{ID: irEndpoint.Name.OriginalName, FernFilepath: irService.Name.FernFilepath, Endpoint: irEndpoint})
		}
	}
	if irServiceTypeReferenceInfo == nil {
		// If the service type reference info isn't provided, default
		// to the file-per-type naming convention.
		for _, irType := range irTypes {
			fileInfo := fileInfoForType(apiName, irType.Name.FernFilepath)
			result[fileInfo] = append(result[fileInfo], &typeToGenerate{ID: irType.Name.TypeId, FernFilepath: irType.Name.FernFilepath, TypeDeclaration: irType})
		}
	} else {
		directories := make(map[fernir.TypeId][]string)
		for irTypeId, irType := range irTypes {
			var elements []string
			for _, packageName := range irType.Name.FernFilepath.PackagePath {
				elements = append(elements, strings.ToLower(packageName.CamelCase.SafeName))
			}
			directories[irTypeId] = elements
		}
		sharedTypes := irServiceTypeReferenceInfo.SharedTypes
		if typeIds, ok := irServiceTypeReferenceInfo.TypesReferencedOnlyByService["service_"]; ok {
			// The root service types should be included alongside the other shared types.
			sharedTypes = append(sharedTypes, typeIds...)
		}
		for _, sharedTypeId := range sharedTypes {
			typeDeclaration, ok := irTypes[sharedTypeId]
			if !ok {
				// Should be unreachable.
				return nil, fmt.Errorf("IR ServiceTypeReferenceInfo referenced type %q which doesn't exist", sharedTypeId)
			}
			fileInfo := fileInfo{
				filename:    "types.go",
				packageName: strings.ToLower(apiName.CamelCase.SafeName),
			}
			if directory := directories[sharedTypeId]; len(directory) > 0 {
				fileInfo.filename = filepath.Join(append(directory, fileInfo.filename)...)
				fileInfo.packageName = directory[len(directory)-1]
			}
			result[fileInfo] = append(result[fileInfo], &typeToGenerate{ID: typeDeclaration.Name.TypeId, FernFilepath: typeDeclaration.Name.FernFilepath, TypeDeclaration: typeDeclaration})
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
			fernFilepath := service.Name.FernFilepath
			var basename string
			if service.Name.FernFilepath.File != nil {
				basename = fernFilepath.File.SnakeCase.UnsafeName
			} else {
				basename = fernFilepath.PackagePath[len(fernFilepath.PackagePath)-1].SnakeCase.UnsafeName
			}
			var packages []string
			for _, packageName := range fernFilepath.PackagePath {
				packages = append(packages, strings.ToLower(packageName.CamelCase.SafeName))
			}
			packageName := strings.ToLower(apiName.CamelCase.SafeName)
			if len(packages) > 0 {
				packageName = packages[len(packages)-1]
			}
			fileInfo := fileInfo{
				filename:    filepath.Join(append(packages, fmt.Sprintf("%s.go", basename))...),
				packageName: packageName,
			}
			for _, typeId := range typeIds {
				typeDeclaration, ok := irTypes[typeId]
				if !ok {
					// Should be unreachable.
					return nil, fmt.Errorf("IR ServiceTypeReferenceInfo referenced type %q which doesn't exist", typeId)
				}
				result[fileInfo] = append(result[fileInfo], &typeToGenerate{ID: typeDeclaration.Name.TypeId, FernFilepath: typeDeclaration.Name.FernFilepath, TypeDeclaration: typeDeclaration})
			}
		}
	}
	// Sort the results so that we have deterministic behavior.
	for fileInfo := range result {
		sort.Slice(result[fileInfo], func(i, j int) bool { return result[fileInfo][i].ID < result[fileInfo][j].ID })
	}
	return result, nil
}

func fileInfoToErrors(
	apiName *fernir.Name,
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
			packageName: strings.ToLower(apiName.CamelCase.SafeName),
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
