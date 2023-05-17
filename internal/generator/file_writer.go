package generator

import (
	"bytes"
	"fmt"
	"go/format"
	"strings"

	"github.com/fern-api/fern-go/internal/types"
)

// fileWriter wries and formats Go files.
type fileWriter struct {
	filename    string
	packageName string
	imports     map[string]struct{}
	buffer      *bytes.Buffer

	// TODO: Do we need some sort of type registry so that we can consult other types
	// based on their DeclaredTypeName? This will let us handle 'extends', for example.
}

func newFileWriter(filename string) *fileWriter {
	return &fileWriter{
		filename: filename,
		buffer:   new(bytes.Buffer),

		// The default set of imports used in the generated output.
		imports: map[string]struct{}{
			"time":                  struct{}{},
			"github.com/gofrs/uuid": struct{}{},
		},
	}
}

// P writes the given element into a single line, concluding with a newline.
func (f *fileWriter) P(elements ...any) {
	for _, element := range elements {
		fmt.Fprint(f.buffer, element)
	}
	fmt.Fprintln(f.buffer)
}

// Finish formats and writes the content stored in the writer's buffer into a *File.
//
// TODO: We might want to reserve the package declaration and import statements until
// the very end and apply them here. That way we can capture all of the manual and
// user-provided statements in a single block at the top of the file.
func (f *fileWriter) File() (*File, error) {
	// Start with the package declaration and import statements.
	header := newFileWriter(f.filename)
	header.P("package ", f.packageName)
	header.P("import (")
	for _, importDecl := range f.imports {
		header.P(fmt.Sprintf("%q", importDecl))
	}
	header.P(")")

	formatted, err := format.Source(append(header.buffer.Bytes(), f.buffer.Bytes()...))
	if err != nil {
		return nil, err
	}
	return &File{
		Path:    f.filename,
		Content: formatted,
	}, nil
}

// AddPackage adds the package declaration to be written later.
func (f *fileWriter) AddPackage(apiName *types.Name) error {
	f.packageName = strings.ToLower(apiName.CamelCase.SafeName)
	return nil
}

// WriteType writes a complete type, including all of its properties.
func (f *fileWriter) WriteType(typeDeclaration *types.TypeDeclaration) error {
	f.P("type ", typeDeclaration.Name.Name.PascalCase.UnsafeName, " struct {")
	switch shape := typeDeclaration.Shape.(type) {
	case *types.ObjectTypeDeclaration:
		for _, property := range shape.Properties {
			f.writeProperty(property)
		}
	}
	f.P("}")
	return nil
}

func (f *fileWriter) writeProperty(property *types.ObjectProperty) error {
	switch valueType := property.ValueType.(type) {
	case *types.TypeReferencePrimitive:
		f.P(property.Name.Name.PascalCase.UnsafeName, " ", primitiveToGoType(valueType))
	}
	return nil
}

// primitiveToGoType maps Fern's primitive types to their Go-equivalent.
func primitiveToGoType(p *types.TypeReferencePrimitive) string {
	switch p.Primitive {
	case types.PrimitiveTypeInteger:
		return "int"
	case types.PrimitiveTypeDouble:
		return "float64"
	case types.PrimitiveTypeString:
		return "string"
	case types.PrimitiveTypeBoolean:
		return "bool"
	case types.PrimitiveTypeLong:
		return "int64"
	// TODO: We'll need to add some special handling for [un]marshaling Date[Time] to and from time.Time.
	case types.PrimitiveTypeDateTime:
		return "time.Time"
	case types.PrimitiveTypeDate:
		return "time.Time"
	case types.PrimitiveTypeUUID:
		return "uuid.UUID"
	case types.PrimitiveTypeBase64:
		return "[]byte"
	default:
		return "unknown"
	}
}
