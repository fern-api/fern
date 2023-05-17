package generator

import (
	"bytes"
	"fmt"
	"go/format"
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
	writer := newFileWriter(fmt.Sprintf("%s.go", ir.APIName.SnakeCase.UnsafeName))
	if err := writer.WritePackage(ir.APIName); err != nil {
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

func newFileWriter(filename string) *fileWriter {
	return &fileWriter{
		filename: filename,
		buffer:   new(bytes.Buffer),
		imports:  make(map[string]struct{}),
	}
}

// fileWriter wries and formats Go files.
type fileWriter struct {
	filename string
	buffer   *bytes.Buffer

	// TODO: Placeholder for now - we'll want to use something a little more sophisticated.
	imports map[string]struct{}
}

func (f *fileWriter) WritePackage(apiName *types.Name) error {
	f.P("package ", strings.ToLower(apiName.CamelCase.SafeName))
	return nil
}

func (f *fileWriter) WriteType(typeDeclaration *types.TypeDeclaration) error {
	f.P("type ", typeDeclaration.Name.Name.PascalCase.UnsafeName, " struct {")
	switch shape := typeDeclaration.Shape.(type) {
	case *types.ObjectTypeDeclaration:
		for _, property := range shape.Properties {
			var typeIdentifier string
			switch valueType := property.ValueType.(type) {
			case *types.TypeReferencePrimitive:
				// TODO: This is a hack as-is; it only works for a couple of the primitive types.
				typeIdentifier = strings.ToLower(valueType.Primitive.String())
			}
			f.P(property.Name.Name.PascalCase.UnsafeName, " ", typeIdentifier)
		}
	}
	f.P("}")
	return nil
}

// P writes the given element into a single line, concluding with a newline.
func (f *fileWriter) P(elements ...any) {
	for _, element := range elements {
		fmt.Fprint(f.buffer, element)
	}
	fmt.Fprintln(f.buffer)
}

// Finish formats and writes the content stored in the writer's buffer into a *File.
func (f *fileWriter) File() (*File, error) {
	formatted, err := format.Source(f.buffer.Bytes())
	if err != nil {
		return nil, err
	}
	return &File{
		Path:    f.filename,
		Content: formatted,
	}, nil
}
