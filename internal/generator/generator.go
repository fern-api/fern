package generator

import (
	"fmt"

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
	writer := newFileWriter(fmt.Sprintf("%s.go", ir.APIName.SnakeCase.UnsafeName))
	if err := writer.AddPackage(ir.APIName); err != nil {
		return nil, err
	}
	for _, irType := range ir.Types {
		// TODO: How do we want to delineate types across files? Should
		// a single file contain all of the types? It should probably
		// correspond to the FernFilepath associated with every type.
		if err := writer.WriteType(irType); err != nil {
			return nil, err
		}
	}
	file, err := writer.File()
	if err != nil {
		return nil, err
	}
	return []*File{file}, nil
}
