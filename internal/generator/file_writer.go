package generator

import (
	"bytes"
	"errors"
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
	types       map[types.TypeID]*types.TypeDeclaration
	buffer      *bytes.Buffer
}

func newFileWriter(
	filename string,
	packageName string,
	types map[types.TypeID]*types.TypeDeclaration,
) *fileWriter {
	// The default set of imports used in the generated output.
	// These imports are removed from the generated output if
	// they aren't used.
	imports := make(imports)
	imports.Add("fmt")
	imports.Add("encoding/json")
	imports.Add("strconv")
	imports.Add("time")
	imports.Add("github.com/gofrs/uuid")

	return &fileWriter{
		filename:    filename,
		packageName: packageName,
		imports:     imports,
		types:       types,
		buffer:      new(bytes.Buffer),
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
func (f *fileWriter) File() (*File, error) {
	// Start with the package declaration and import statements.
	header := newFileWriter(f.filename, f.packageName, f.types)
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

// WriteType writes a complete type, including all of its properties.
func (f *fileWriter) WriteType(typeDeclaration *types.TypeDeclaration) error {
	visitor := &typeVisitor{
		typeName: typeDeclaration.Name.Name.PascalCase.UnsafeName,
		writer:   f,
	}
	return typeDeclaration.Shape.Accept(visitor)
}

// typeReferenceToGoType maps the given type reference into its Go-equivalent.
// TODO: Handle the case where this type is defined in another package.
func typeReferenceToGoType(typeReference *types.TypeReference, types map[types.TypeID]*types.TypeDeclaration) string {
	visitor := &typeReferenceVisitor{
		types: types,
	}
	_ = typeReference.Accept(visitor)
	return visitor.value
}

// containerTypeToGoType maps the given container type into its Go-equivalent.
func containerTypeToGoType(containerType *types.ContainerType, types map[types.TypeID]*types.TypeDeclaration) string {
	visitor := &containerTypeVisitor{
		types: types,
	}
	_ = containerType.Accept(visitor)
	return visitor.value
}

// singleUnionTypePropertiesToGoType maps the given container type into its Go-equivalent.
func singleUnionTypePropertiesToGoType(singleUnionTypeProperties *types.SingleUnionTypeProperties, types map[types.TypeID]*types.TypeDeclaration) string {
	visitor := &singleUnionTypePropertiesVisitor{
		types: types,
	}
	_ = singleUnionTypeProperties.Accept(visitor)
	return visitor.value
}

// singleUnionTypePropertiesToInitializer maps the given container type into its Go-equivalent initializer.
//
// Note this returns the string representation of the statement required to initialize
// the given property, e.g. 'value := new(Foo)'
func singleUnionTypePropertiesToInitializer(singleUnionTypeProperties *types.SingleUnionTypeProperties, types map[types.TypeID]*types.TypeDeclaration) string {
	visitor := &singleUnionTypePropertiesInitializerVisitor{
		types: types,
	}
	_ = singleUnionTypeProperties.Accept(visitor)
	return visitor.value
}

// literalToGoType maps the given literal into its Go-equivalent.
func literalToGoType(literal *types.Literal) string {
	visitor := new(literalVisitor)
	_ = literal.Accept(visitor)
	return visitor.value
}

// typeVisitor writes the internal properties of types (e.g. properties).
type typeVisitor struct {
	typeName string
	writer   *fileWriter
}

// Compile-time assertion.
var _ types.TypeVisitor = (*typeVisitor)(nil)

func (t *typeVisitor) VisitAlias(alias *types.AliasTypeDeclaration) error {
	t.writer.P("type ", t.typeName, " = ", typeReferenceToGoType(alias.AliasOf, t.writer.types))
	t.writer.P()
	return nil
}

func (t *typeVisitor) VisitEnum(enum *types.EnumTypeDeclaration) error {
	// Write the enum type definition.
	t.writer.P("type ", t.typeName, " uint8")
	t.writer.P()

	// Write all of the supported enum values in a single const block.
	t.writer.P("const (")
	for i, enumValue := range enum.Values {
		enumName := t.typeName + enumValue.Name.Name.PascalCase.UnsafeName
		if i == 0 {
			t.writer.P(enumName, " ", t.typeName, " = iota + 1")
			continue
		}
		t.writer.P(enumName)
	}
	t.writer.P(")")
	t.writer.P()

	// Implement the fmt.Stringer interface.
	t.writer.P("func (x ", t.typeName, ") String() string {")
	t.writer.P("switch x {")
	for i, enumValue := range enum.Values {
		if i == 0 {
			// Implement the default case first.
			t.writer.P("default:")
			t.writer.P("return strconv.Itoa(int(x))")
		}
		enumName := t.typeName + enumValue.Name.Name.PascalCase.UnsafeName
		t.writer.P("case ", enumName, ":")
		t.writer.P("return \"", enumValue.Name.WireValue, "\"")
	}
	t.writer.P("}")
	t.writer.P("}")
	t.writer.P()

	// Implement the json.Marshaler interface.
	t.writer.P("func (x ", t.typeName, ") MarshalJSON() ([]byte, error) {")
	t.writer.P("return []byte(fmt.Sprintf(\"%q\", x.String())), nil")
	t.writer.P("}")
	t.writer.P()

	// Implement the json.Unmarshaler interface.
	t.writer.P("func (x *", t.typeName, ") UnmarshalJSON(data []byte) error {")
	t.writer.P("var raw string")
	t.writer.P("if err := json.Unmarshal(data, &raw); err != nil {")
	t.writer.P("return err")
	t.writer.P("}")
	t.writer.P("switch raw {")
	for _, enumValue := range enum.Values {
		enumName := t.typeName + enumValue.Name.Name.PascalCase.UnsafeName
		t.writer.P("case \"", enumValue.Name.WireValue, "\":")
		t.writer.P("value := ", enumName)
		t.writer.P("*x = value")
	}
	t.writer.P("}")
	t.writer.P("return nil")
	t.writer.P("}")
	t.writer.P()

	return nil
}

func (t *typeVisitor) VisitObject(object *types.ObjectTypeDeclaration) error {
	// TODO: Write extended properties.
	t.writer.P("type ", t.typeName, " struct {")
	for _, property := range object.Properties {
		t.writer.P(property.Name.Name.PascalCase.UnsafeName, " ", typeReferenceToGoType(property.ValueType, t.writer.types), " `json:\"", property.Name.Name.CamelCase.UnsafeName, "\"`")
	}
	t.writer.P("}")
	t.writer.P()
	return nil
}

func (t *typeVisitor) VisitUnion(union *types.UnionTypeDeclaration) error {
	// TODO: Write extended properties.

	// Write the union type definition.
	discriminantName := union.Discriminant.Name.PascalCase.UnsafeName
	t.writer.P("type ", t.typeName, " struct {")
	t.writer.P(discriminantName, " string")
	for _, property := range union.BaseProperties {
		t.writer.P(property.Name.Name.PascalCase.UnsafeName, " ", typeReferenceToGoType(property.ValueType, t.writer.types))
	}
	for _, unionType := range union.Types {
		typeName := singleUnionTypePropertiesToGoType(unionType.Shape, t.writer.types)
		if typeName == "" {
			// If the union has no properties, there's nothing for us to do.
			continue
		}
		t.writer.P(unionType.DiscriminantValue.Name.PascalCase.UnsafeName, " ", typeName)
	}
	t.writer.P("}")
	t.writer.P()

	// Implement the json.Unmarshaler interface.
	t.writer.P("func (x *", t.typeName, ") UnmarshalJSON(data []byte) error {")
	t.writer.P("var unmarshaler struct {")
	t.writer.P(discriminantName, " string `json:\"", union.Discriminant.WireValue, "\"`")
	t.writer.P("}")
	t.writer.P("if err := json.Unmarshal(data, &unmarshaler); err != nil {")
	t.writer.P("return err")
	t.writer.P("}")

	// Set the union's type on the exported type.
	t.writer.P("x.", discriminantName, " = unmarshaler.", discriminantName)

	// Generate the switch to unmarshal the appropriate type.
	t.writer.P("switch unmarshaler.", discriminantName, " {")
	for _, unionType := range union.Types {
		t.writer.P("case \"", unionType.DiscriminantValue.Name.OriginalName, "\":")
		t.writer.P(singleUnionTypePropertiesToInitializer(unionType.Shape, t.writer.types))
		t.writer.P("if err := json.Unmarshal(data, &unmarshaler); err != nil {")
		t.writer.P("return err")
		t.writer.P("}")
		t.writer.P("x.", unionType.DiscriminantValue.Name.PascalCase.UnsafeName, " = value")
	}
	t.writer.P("}")
	t.writer.P("return nil")
	t.writer.P("}")
	t.writer.P()

	// Generate the Visitor interface.
	t.writer.P("type ", t.typeName, "Visitor interface {")
	for _, unionType := range union.Types {
		t.writer.P("Visit", unionType.DiscriminantValue.Name.PascalCase.UnsafeName, "(", singleUnionTypePropertiesToGoType(unionType.Shape, t.writer.types), ") error")
	}
	t.writer.P("}")
	t.writer.P()

	// Generate the Accept method.
	t.writer.P("func (x *", t.typeName, ") Accept(v ", t.typeName, "Visitor) error {")
	t.writer.P("switch x.", discriminantName, "{")
	for i, unionType := range union.Types {
		if i == 0 {
			// Implement the default case first.
			t.writer.P("default:")
			t.writer.P("return fmt.Errorf(\"invalid type %s in %T\", x.", discriminantName, ", x)")
		}
		t.writer.P("case \"", unionType.DiscriminantValue.Name.OriginalName, "\":")
		t.writer.P("return v.Visit", unionType.DiscriminantValue.Name.PascalCase.UnsafeName, "(x.", unionType.DiscriminantValue.Name.PascalCase.UnsafeName, ")")
	}
	t.writer.P("}")
	t.writer.P("}")
	t.writer.P()

	return nil
}

func (t *typeVisitor) VisitUndiscriminatedUnion(union *types.UndiscriminatedUnionTypeDeclaration) error {
	return errors.New("unimplemented")
}

// typeReferenceVisitor retrieves the string representation of type references
// (e.g. containers, primitives, etc).
type typeReferenceVisitor struct {
	value string
	types map[types.TypeID]*types.TypeDeclaration
}

// Compile-time assertion.
var _ types.TypeReferenceVisitor = (*typeReferenceVisitor)(nil)

func (t *typeReferenceVisitor) VisitContainer(container *types.ContainerType) error {
	t.value = containerTypeToGoType(container, t.types)
	return nil
}

func (t *typeReferenceVisitor) VisitNamed(named *types.DeclaredTypeName) error {
	format := "%s"
	if isPointer(t.types[named.TypeID]) {
		format = "*%s"
	}
	t.value = fmt.Sprintf(format, named.Name.PascalCase.UnsafeName)
	return nil
}

func (t *typeReferenceVisitor) VisitPrimitive(primitive types.PrimitiveType) error {
	t.value = primitiveToGoType(primitive)
	return nil
}

func (t *typeReferenceVisitor) VisitUnknown(unknown any) error {
	t.value = unknownToGoType(unknown)
	return nil
}

// containerTypeVisitor retrieves the string representation of container types
// (e.g. lists, maps, etc).
type containerTypeVisitor struct {
	value string
	types map[types.TypeID]*types.TypeDeclaration
}

// Compile-time assertion.
var _ types.ContainerTypeVisitor = (*containerTypeVisitor)(nil)

func (c *containerTypeVisitor) VisitList(list *types.TypeReference) error {
	c.value = fmt.Sprintf("[]%s", typeReferenceToGoType(list, c.types))
	return nil
}

func (c *containerTypeVisitor) VisitMap(mapType *types.MapType) error {
	c.value = fmt.Sprintf("map[%s]%s", typeReferenceToGoType(mapType.KeyType, c.types), typeReferenceToGoType(mapType.ValueType, c.types))
	return nil
}

func (c *containerTypeVisitor) VisitOptional(optional *types.TypeReference) error {
	c.value = fmt.Sprintf("*%s", typeReferenceToGoType(optional, c.types))
	return nil
}

func (c *containerTypeVisitor) VisitSet(set *types.TypeReference) error {
	c.value = fmt.Sprintf("[]%s", typeReferenceToGoType(set, c.types))
	return nil
}

func (c *containerTypeVisitor) VisitLiteral(literal *types.Literal) error {
	c.value = literalToGoType(literal)
	return nil
}

// singleUnionTypePropertiesVisitor retrieves the string representation of
// single union type properties.
type singleUnionTypePropertiesVisitor struct {
	value string
	types map[types.TypeID]*types.TypeDeclaration
}

// Compile-time assertion.
var _ types.SingleUnionTypePropertiesVisitor = (*singleUnionTypePropertiesVisitor)(nil)

func (c *singleUnionTypePropertiesVisitor) VisitSamePropertiesAsObject(named *types.DeclaredTypeName) error {
	format := "%s"
	if isPointer(c.types[named.TypeID]) {
		format = "*%s"
	}
	c.value = fmt.Sprintf(format, named.Name.PascalCase.UnsafeName)
	return nil
}

func (c *singleUnionTypePropertiesVisitor) VisitSingleProperty(property *types.SingleUnionTypeProperty) error {
	c.value = typeReferenceToGoType(property.Type, c.types)
	return nil
}

func (c *singleUnionTypePropertiesVisitor) VisitNoProperties(_ any) error {
	c.value = "any"
	return nil
}

// singleUnionTypePropertiesInitializerVisitor retrieves the string representation of
// single union type property initializers.
//
// This visitor determines the string representation of the constructor used
// in the json.Unmarshaler implementation.
type singleUnionTypePropertiesInitializerVisitor struct {
	value string
	types map[types.TypeID]*types.TypeDeclaration
}

// Compile-time assertion.
var _ types.SingleUnionTypePropertiesVisitor = (*singleUnionTypePropertiesInitializerVisitor)(nil)

func (c *singleUnionTypePropertiesInitializerVisitor) VisitSamePropertiesAsObject(named *types.DeclaredTypeName) error {
	format := "var value %s"
	if isPointer(c.types[named.TypeID]) {
		format = "value := new(%s)"
	}
	c.value = fmt.Sprintf(format, named.Name.PascalCase.UnsafeName)
	return nil
}

func (c *singleUnionTypePropertiesInitializerVisitor) VisitSingleProperty(property *types.SingleUnionTypeProperty) error {
	format := "var value %s"
	if property.Type.Named != nil && isPointer(c.types[property.Type.Named.TypeID]) {
		format = "value := new(%s)"
	}
	// Trim the '*' prefix, if any, so that the constructor above is compatible.
	c.value = fmt.Sprintf(format, strings.TrimPrefix(typeReferenceToGoType(property.Type, c.types), "*"))
	return nil
}

func (c *singleUnionTypePropertiesInitializerVisitor) VisitNoProperties(_ any) error {
	c.value = "value := make(map[string]any)"
	return nil
}

// containerTypeVisitor retrieves the string representation of literal types.
// Strings are the only supported literals for now.
type literalVisitor struct {
	value string
}

// Compile-time assertion.
var _ types.LiteralVisitor = (*literalVisitor)(nil)

func (l *literalVisitor) VisitString(value string) error {
	l.value = value
	return nil
}

// unknownToGoType maps the given unknown into its Go-equivalent.
func unknownToGoType(_ any) string {
	return "any"
}

// primitiveToGoType maps Fern's primitive types to their Go-equivalent.
func primitiveToGoType(primitive types.PrimitiveType) string {
	switch primitive {
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
		return "any"
	}
}

// isPointer returns true if the given type is a pointer type (e.g. objects and
// unions). Enums, primitives, and aliases of these types do not require pointers.
func isPointer(typeDeclaration *types.TypeDeclaration) bool {
	switch typeDeclaration.Shape.Type {
	case "object", "union", "undiscriminatedUnion":
		return true
	case "alias", "enum", "primitive":
		// TODO: What about an alias to an object or union?
		return false
	}
	// Unreachable.
	return false
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
