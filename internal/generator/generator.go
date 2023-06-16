package generator

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/fern-api/fern-go/internal/fern/ir"
)

// packageDocsFilename represents the standard package documentation filename.
const packageDocsFilename = "doc.go"

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

func (g *Generator) generate(ir *ir.IntermediateRepresentation, mode Mode) ([]*File, error) {
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
		file, err := writer.DocsFile()
		if err != nil {
			return nil, err
		}
		files = append(files, file)
	}
	for _, subpackage := range ir.Subpackages {
		if subpackage.Docs == nil || len(*subpackage.Docs) == 0 {
			continue
		}
		fileInfo := fileInfoForPackage(ir.ApiName, subpackage.FernFilepath)
		writer := newFileWriter(fileInfo.filename, fileInfo.packageName, "", nil, nil)
		writer.WriteDocs(subpackage.Docs)
		file, err := writer.DocsFile()
		if err != nil {
			return nil, err
		}
		files = append(files, file)
	}
	switch mode {
	case ModeModel:
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
	case ModeClient:
		if g.config.ImportPath == "" {
			return nil, errors.New("the SDK requires an import path configuration")
		}
		if ir.ErrorDiscriminationStrategy != nil && ir.ErrorDiscriminationStrategy.StatusCode == nil {
			return nil, errors.New("this generator only supports the status-code error discrimination strategy")
		}
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
		files = append(files, newCoreFile())
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
		for _, irService := range ir.Services {
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
			fileInfo := fileInfoForClient(ir.ApiName, irService)
			writer := newFileWriter(
				fileInfo.filename,
				fileInfo.packageName,
				g.config.ImportPath,
				ir.Types,
				ir.Errors,
			)
			if err := writer.WriteClient(irService); err != nil {
				return nil, err
			}
			file, err := writer.File()
			if err != nil {
				return nil, err
			}
			files = append(files, file)
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
	}
	return files, nil
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

func fileInfoForClient(apiName *ir.Name, service *ir.HttpService) *fileInfo {
	var packages []string
	for _, packageName := range service.Name.FernFilepath.PackagePath {
		packages = append(packages, strings.ToLower(packageName.CamelCase.SafeName))
	}
	serviceName := service.Name.FernFilepath.File.SnakeCase.UnsafeName
	if len(packages) == 0 {
		// This type didn't declare a package, so it belongs at the top-level.
		// The top-level package uses the API's name as its package declaration.
		return &fileInfo{
			filename:    fmt.Sprintf("%s_client.go", serviceName),
			packageName: strings.ToLower(apiName.CamelCase.SafeName),
		}
	}
	return &fileInfo{
		filename:    fmt.Sprintf("%s_client.go", filepath.Join(append(packages, serviceName)...)),
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
