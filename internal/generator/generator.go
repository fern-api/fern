package generator

import (
	"fmt"
	"path/filepath"
	"strings"

	"github.com/fern-api/fern-go/internal/types"
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

// Generate runs the code generation process.
func (g *Generator) Generate() ([]*File, error) {
	ir, err := types.ReadIR(g.config.IRFilepath)
	if err != nil {
		return nil, err
	}
	return g.generate(ir)
}

func (g *Generator) generate(ir *types.IntermediateRepresentation) ([]*File, error) {
	var files []*File
	for _, irType := range ir.Types {
		fileInfo := fileInfoForTypeDeclaration(ir.APIName, irType)
		writer := newFileWriter(
			fileInfo.filename,
			fileInfo.packageName,
			ir.Types,
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
	return files, nil
}

type fileInfo struct {
	filename    string
	packageName string
}

func fileInfoForTypeDeclaration(apiName *types.Name, typeDeclaration *types.TypeDeclaration) *fileInfo {
	var packages []string
	for _, packageName := range typeDeclaration.Name.FernFilepath.PackagePath {
		packages = append(packages, strings.ToLower(packageName.CamelCase.SafeName))
	}
	typeName := typeDeclaration.Name.Name.SnakeCase.UnsafeName
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
