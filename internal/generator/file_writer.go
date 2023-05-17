package generator

import (
	"bytes"
	"fmt"
	"go/format"
	"go/parser"
	"go/token"
	"strconv"
	"strings"

	"github.com/fern-api/fern-go/internal/types"
	"golang.org/x/tools/go/ast/astutil"
)

// fileWriter wries and formats Go files.
type fileWriter struct {
	filename    string
	packageName string
	imports     imports
	buffer      *bytes.Buffer

	// TODO: Do we need some sort of type registry so that we can consult other types
	// based on their DeclaredTypeName? This will let us handle 'extends', for example.
}

func newFileWriter(filename string) *fileWriter {
	// The default set of imports used in the generated output.
	// These imports are removed from the generated output if
	// they aren't used.
	imports := make(imports)
	imports.Add("time")
	imports.Add("github.com/gofrs/uuid")

	return &fileWriter{
		filename: filename,
		buffer:   new(bytes.Buffer),
		imports:  imports,
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
	for importDecl, importAlias := range f.imports {
		header.P(fmt.Sprintf("%s %q", importAlias, importDecl))
	}
	header.P(")")

	formatted, err := removeUnusedImports(f.filename, append(header.buffer.Bytes(), f.buffer.Bytes()...))
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
			f.P(property.Name.Name.PascalCase.UnsafeName, " ", typeReferenceToGoType(property.ValueType), " `json:\"", property.Name.Name.CamelCase.UnsafeName, "\"`")
		}
	}
	f.P("}")
	return nil
}

// typeReferenceToGoType maps the given type reference into its Go-equivalent.
// TODO: Handle the case where this type is defined in another package.
func typeReferenceToGoType(typeReference types.TypeReference) string {
	switch value := typeReference.(type) {
	case *types.TypeReferenceContainer:
		return containerTypeToGoType(value.Container)
	case *types.TypeReferenceNamed:
		return value.Named.Name.PascalCase.UnsafeName
	case *types.TypeReferencePrimitive:
		return primitiveToGoType(value)
	case *types.TypeReferenceUnknown:
		return unknownToGoType(value)
	}
	return ""
}

// containerTypeToGoType maps the given container type into its Go-equivalent.
func containerTypeToGoType(containerType types.ContainerType) string {
	switch value := containerType.(type) {
	case *types.ContainerTypeList:
		return containerTypeListToGoType(value)
	case *types.ContainerTypeMap:
		return containerTypeMapToGoType(value)
	case *types.ContainerTypeOptional:
		return containerTypeOptionalToGoType(value)
	case *types.ContainerTypeSet:
		return containerTypeSetToGoType(value)
	case *types.ContainerTypeLiteral:
		return containerTypeLiteralToGoType(value)
	}
	return ""
}

// containerTypeListToGoType maps the given list into its Go-equivalent.
func containerTypeListToGoType(containerTypeList *types.ContainerTypeList) string {
	return fmt.Sprintf("[]%s", typeReferenceToGoType(containerTypeList.List))
}

// containerTypeMapToGoType maps the given map into its Go-equivalent.
func containerTypeMapToGoType(containerTypeMap *types.ContainerTypeMap) string {
	return fmt.Sprintf("map[%s]%s", typeReferenceToGoType(containerTypeMap.KeyType), typeReferenceToGoType(containerTypeMap.ValueType))
}

// containerTypeOptionalToGoType maps the given optional into its Go-equivalent.
func containerTypeOptionalToGoType(containerTypeMap *types.ContainerTypeOptional) string {
	return fmt.Sprintf("*%s", typeReferenceToGoType(containerTypeMap.Optional))
}

// containerTypeSetToGoType maps the given set into its Go-equivalent.
func containerTypeSetToGoType(containerTypeSet *types.ContainerTypeSet) string {
	return fmt.Sprintf("[]%s", typeReferenceToGoType(containerTypeSet.Set))
}

// containerTypeLiteralToGoType maps the given literal into its Go-equivalent.
func containerTypeLiteralToGoType(containerTypeLiteral *types.ContainerTypeLiteral) string {
	return literalToGoType(containerTypeLiteral.Literal)
}

// literalToGoType maps the given literal into its Go-equivalent.
func literalToGoType(literal types.Literal) string {
	switch value := literal.(type) {
	case *types.LiteralString:
		return value.String
	}
	return ""
}

// unknownToGoType maps the given unknown into its Go-equivalent.
func unknownToGoType(_ *types.TypeReferenceUnknown) string {
	return "any"
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

// removeUnusedImports parses the buffer, interpreting it as Go code,
// and removes all unused imports. If successful, the result is then
// formatted.
func removeUnusedImports(filename string, buf []byte) ([]byte, error) {
	fset := token.NewFileSet()
	f, err := parser.ParseFile(fset, filename, buf, parser.ParseComments)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Go code: %v", err)
	}

	imports := make(map[string]string)
	for _, route := range f.Imports {
		importPath, err := strconv.Unquote(route.Path.Value)
		if err != nil {
			// Unreachable. If the file parsed successfully,
			// the unquote will never fail.
			return nil, err
		}
		imports[route.Name.Name] = importPath
	}

	for name, path := range imports {
		if !astutil.UsesImport(f, path) {
			astutil.DeleteNamedImport(fset, f, name, path)
		}
	}

	var buffer bytes.Buffer
	if err := format.Node(&buffer, fset, f); err != nil {
		return nil, fmt.Errorf("failed to format Go code: %v", err)
	}

	return buffer.Bytes(), nil
}
