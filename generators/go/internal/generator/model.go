package generator

import (
	_ "embed"
	"fmt"
	"path"
	"strconv"
	"strings"
	"unicode"

	"github.com/fern-api/fern-go/internal/fern/ir"
	"github.com/fern-api/fern-go/internal/gospec"
)

var (
	//go:embed model/core/extra_properties.go
	extraPropertiesFile string

	//go:embed model/core/extra_properties_test.go
	extraPropertiesTestFile string

	//go:embed model/core/stringer.go
	stringerFile string

	//go:embed model/core/time.go
	timeFile string
)

// WriteType writes a complete type, including all of its properties.
func (f *fileWriter) WriteType(
	typeDeclaration *ir.TypeDeclaration,
	includeRawJSON bool,
) error {
	visitor := &typeVisitor{
		typeName:       typeDeclaration.Name.Name.PascalCase.UnsafeName,
		baseImportPath: f.baseImportPath,
		importPath:     fernFilepathToImportPath(f.baseImportPath, typeDeclaration.Name.FernFilepath),
		writer:         f,
		unionVersion:   f.unionVersion,
		includeRawJSON: includeRawJSON,
	}
	f.WriteDocs(typeDeclaration.Docs)
	return typeDeclaration.Shape.Accept(visitor)
}

// typeVisitor writes the internal properties of types (e.g. properties).
type typeVisitor struct {
	typeName       string
	baseImportPath string
	importPath     string
	writer         *fileWriter

	unionVersion   UnionVersion
	includeRawJSON bool
}

// Compile-time assertion.
var _ ir.TypeVisitor = (*typeVisitor)(nil)

func (t *typeVisitor) VisitAlias(alias *ir.AliasTypeDeclaration) error {
	t.writer.P("type ", t.typeName, " = ", typeReferenceToGoType(alias.AliasOf, t.writer.types, t.writer.scope, t.baseImportPath, t.importPath, false))
	t.writer.P()
	return nil
}

func (t *typeVisitor) VisitEnum(enum *ir.EnumTypeDeclaration) error {
	// Write the enum type definition.
	t.writer.P("type ", t.typeName, " string")
	t.writer.P()

	// We first need to determine whether or not this enum requires us to
	// use its wire value (as opposed to just its enum name). This prevents
	// collisions that would otherwise occur by an equivalent pascal case
	// representation. For example,
	//
	// type Something uint8
	//
	// const (
	//   SomethingOne Something = iota + 1
	//   SomethingONE Something
	// )
	//
	var useEnumWireValue bool
	enumNames := make(map[string]struct{}, len(enum.Values))
	for _, enumValue := range enum.Values {
		enumName := enumValue.Name.Name.PascalCase.UnsafeName
		if _, ok := enumNames[enumName]; ok {
			useEnumWireValue = true
			break
		}
		enumNames[enumName] = struct{}{}
	}

	// Write all of the supported enum values in a single const block.
	t.writer.P("const (")
	for _, enumValue := range enum.Values {
		t.writer.WriteDocs(enumValue.Docs)
		enumName := t.typeName + enumValue.Name.Name.PascalCase.UnsafeName
		if useEnumWireValue {
			enumName = t.typeName + enumValue.Name.WireValue
		}
		t.writer.P(enumName, " ", t.typeName, fmt.Sprintf(" = %q", enumValue.Name.WireValue))
	}
	t.writer.P(")")
	t.writer.P()

	// Generate a constructor that can be used to validate the string value.
	t.writer.P("func New", t.typeName, "FromString(s string) (", t.typeName, ", error) {")
	t.writer.P("switch s {")
	for _, enumValue := range enum.Values {
		enumName := t.typeName + enumValue.Name.Name.PascalCase.UnsafeName
		if useEnumWireValue {
			enumName = t.typeName + enumValue.Name.WireValue
		}
		t.writer.P("case \"", enumValue.Name.WireValue, "\":")
		t.writer.P("return ", enumName, ", nil")
	}
	t.writer.P("}")
	t.writer.P("var t ", t.typeName)
	t.writer.P(`return "", fmt.Errorf("%s is not a valid %T", s, t)`)
	t.writer.P("}")
	t.writer.P()

	// Generate a pointer method so that it's easier to use the enum as
	// an optional value.
	receiver := typeNameToReceiver(t.typeName)
	t.writer.P("func (", receiver, " ", t.typeName, ") Ptr() *", t.typeName, " {")
	t.writer.P("return &", receiver)
	t.writer.P("}")
	t.writer.P()

	return nil
}

func (t *typeVisitor) VisitObject(object *ir.ObjectTypeDeclaration) error {
	t.writer.P("type ", t.typeName, " struct {")
	objectProperties := t.visitObjectProperties(
		object,
		true,  // includeJSONTags
		true,  // includeURLTags
		false, // includeOptionals
	)

	// If the object has a literal, it needs custom [de]serialization logic,
	// and a getter method to access the field so that it's impossible for
	// the user to mutate it.
	//
	// Literals are ignored in visitObjectProperties, so we need to write them
	// here.
	for _, literal := range objectProperties.literals {
		t.writer.P(literal.Name.Name.CamelCase.SafeName, " ", literalToGoType(literal.Value))
	}
	extraPropertiesFieldName := getExtraPropertiesFieldName(object.ExtraProperties)
	if object.ExtraProperties {
		t.writer.P()
		t.writer.P(extraPropertiesFieldName, " map[string]interface{} `json:\"-\" url:\"-\"`")
		t.writer.P()
	} else {
		t.writer.P()
		t.writer.P(extraPropertiesFieldName, " map[string]interface{}")
	}
	if t.includeRawJSON {
		t.writer.P("_rawJSON json.RawMessage")
	}
	t.writer.P("}")
	t.writer.P()

	receiver := typeNameToReceiver(t.typeName)

	// Implement the getter methods.
	t.writer.P("func (", receiver, " *", t.typeName, ") GetExtraProperties() map[string]interface{} {")
	t.writer.P("return ", receiver, ".", extraPropertiesFieldName)
	t.writer.P("}")
	t.writer.P()
	for _, literal := range objectProperties.literals {
		t.writer.P("func (", receiver, " *", t.typeName, ") ", literal.Name.Name.PascalCase.UnsafeName, "()", literalToGoType(literal.Value), "{")
		t.writer.P("return ", receiver, ".", literal.Name.Name.CamelCase.SafeName)
		t.writer.P("}")
		t.writer.P()
	}

	// Implement the json.Unmarshaler interface.
	if len(objectProperties.literals) == 0 && len(objectProperties.dates) == 0 && !object.ExtraProperties {
		// If we don't require any special unmarshaling, prefer the simpler implementation.
		t.writer.P("func (", receiver, " *", t.typeName, ") UnmarshalJSON(data []byte) error {")
		t.writer.P("type unmarshaler ", t.typeName)
		t.writer.P("var value unmarshaler")
		t.writer.P("if err := json.Unmarshal(data, &value); err != nil {")
		t.writer.P("return err")
		t.writer.P("}")
		t.writer.P("*", receiver, " = ", t.typeName, "(value)")
		t.writer.P()
		writeExtractExtraProperties(t.writer, objectProperties.literals, receiver, extraPropertiesFieldName)
		if t.includeRawJSON {
			t.writer.P(receiver, "._rawJSON = json.RawMessage(data)")
		}
		t.writer.P("return nil")
		t.writer.P("}")
		t.writer.P()
	} else {
		t.writer.P("func (", receiver, " *", t.typeName, ") UnmarshalJSON(data []byte) error {")
		t.writer.P("type embed ", t.typeName)
		t.writer.P("var unmarshaler = struct{")
		t.writer.P("embed")
		for _, date := range objectProperties.dates {
			t.writer.P(date.Name.Name.PascalCase.UnsafeName, " ", date.TypeDeclaration, " ", date.StructTag)
		}
		t.writer.P("}{")
		t.writer.P("embed: embed(*", receiver, "),")
		t.writer.P("}")
		t.writer.P("if err := json.Unmarshal(data, &unmarshaler); err != nil {")
		t.writer.P("return err")
		t.writer.P("}")
		t.writer.P("*", receiver, " = ", t.typeName, "(unmarshaler.embed)")
		for _, date := range objectProperties.dates {
			t.writer.P(receiver, ".", date.Name.Name.PascalCase.UnsafeName, " = unmarshaler.", date.Name.Name.PascalCase.UnsafeName, ".", date.TimeMethod)
		}
		for _, literal := range objectProperties.literals {
			t.writer.P(receiver, ".", literal.Name.Name.CamelCase.SafeName, " = ", literalToValue(literal.Value))
		}
		t.writer.P()
		writeExtractExtraProperties(t.writer, objectProperties.literals, receiver, extraPropertiesFieldName)
		if t.includeRawJSON {
			t.writer.P()
			t.writer.P(receiver, "._rawJSON = json.RawMessage(data)")
		}

		t.writer.P("return nil")
		t.writer.P("}")
		t.writer.P()
	}

	// Implement the json.Marshaler interface.
	if len(objectProperties.literals) > 0 || len(objectProperties.dates) > 0 || object.ExtraProperties {
		t.writer.P("func (", receiver, " *", t.typeName, ") MarshalJSON() ([]byte, error) {")
		t.writer.P("type embed ", t.typeName)
		t.writer.P("var marshaler = struct{")
		t.writer.P("embed")
		for _, date := range objectProperties.dates {
			t.writer.P(date.Name.Name.PascalCase.UnsafeName, " ", date.TypeDeclaration, " ", date.StructTag)
		}
		for _, literal := range objectProperties.literals {
			t.writer.P(literal.Name.Name.PascalCase.UnsafeName, " ", literalToGoType(literal.Value), " `json:\"", literal.Name.WireValue, "\"`")
		}
		t.writer.P("}{")
		t.writer.P("embed: embed(*", receiver, "),")
		for _, date := range objectProperties.dates {
			t.writer.P(date.Name.Name.PascalCase.UnsafeName, ": ", date.Constructor, "(", receiver, ".", date.Name.Name.PascalCase.UnsafeName, "),")
		}
		for _, literal := range objectProperties.literals {
			t.writer.P(literal.Name.Name.PascalCase.UnsafeName, ": ", literalToValue(literal.Value), ",")
		}
		t.writer.P("}")
		if object.ExtraProperties {
			t.writer.P("return core.MarshalJSONWithExtraProperties(marshaler, ", receiver, ".ExtraProperties)")
		} else {
			t.writer.P("return json.Marshal(marshaler)")
		}
		t.writer.P("}")
		t.writer.P()
	}

	// Implement fmt.Stringer.
	t.writer.P("func (", receiver, " *", t.typeName, ") String() string {")
	if t.includeRawJSON {
		t.writer.P("if len(", receiver, "._rawJSON) > 0 {")
		t.writer.P("if value, err := core.StringifyJSON(", receiver, "._rawJSON); err == nil {")
		t.writer.P("return value")
		t.writer.P("}")
		t.writer.P("}")
	}
	t.writer.P("if value, err := core.StringifyJSON(", receiver, "); err == nil {")
	t.writer.P("return value")
	t.writer.P("}")
	t.writer.P(`return fmt.Sprintf("%#v", `, receiver, ")")
	t.writer.P("}")
	t.writer.P()

	return nil
}

func (t *typeVisitor) VisitUnion(union *ir.UnionTypeDeclaration) error {
	// Write the union type definition.
	discriminantName := union.Discriminant.Name.PascalCase.UnsafeName
	t.writer.P("type ", t.typeName, " struct {")
	t.writer.P(discriminantName, " string")
	var literals []*literal
	for _, extend := range union.Extends {
		extendedObjectProperties := t.visitObjectProperties(
			t.writer.types[extend.TypeId].Shape.Object,
			false, // includeJSONTags
			false, // includeURLTags
			false, // includeOptionals
		)
		literals = append(literals, extendedObjectProperties.literals...)
	}
	for _, property := range union.BaseProperties {
		if property.ValueType.Container != nil && property.ValueType.Container.Literal != nil {
			literals = append(literals, &literal{Name: property.Name, Value: property.ValueType.Container.Literal})
			continue
		}
		t.writer.P(property.Name.Name.PascalCase.UnsafeName, " ", typeReferenceToGoType(property.ValueType, t.writer.types, t.writer.scope, t.baseImportPath, t.importPath, false))
	}
	// We handle the union's literals separate from the extended and base
	// literals because we only want to set them if they were actually
	// specified by the user.
	var unionLiterals []*literal
	for _, unionType := range union.Types {
		singleUnionProperty := singleUnionTypePropertiesToGoType(unionType.Shape, t.writer.types, t.writer.scope, t.baseImportPath, t.importPath)
		typeName := singleUnionProperty.goType
		if typeName == "" {
			// If the union has no properties, there's nothing for us to do.
			continue
		}
		t.writer.WriteDocs(unionType.Docs)
		if unionType.Shape.PropertiesType == "singleProperty" {
			if unionType.Shape.SingleProperty.Type.Container != nil && unionType.Shape.SingleProperty.Type.Container.Literal != nil {
				// Literal fields must be un-exported.
				t.writer.P(unionType.DiscriminantValue.Name.CamelCase.SafeName, " ", typeName)
				unionLiterals = append(
					unionLiterals,
					&literal{
						Name:  unionType.DiscriminantValue,
						Value: unionType.Shape.SingleProperty.Type.Container.Literal,
					},
				)
				continue
			}
		}
		t.writer.P(unionType.DiscriminantValue.Name.PascalCase.UnsafeName, " ", typeName)
	}
	for _, literal := range literals {
		t.writer.P(literal.Name.Name.CamelCase.SafeName, " ", literalToGoType(literal.Value))
	}
	t.writer.P("}")
	t.writer.P()

	// Implement the constructors. If UnionVersionV1 is enabled, we only generate
	// constructors for literal values.
	for _, unionType := range union.Types {
		fieldName := unionType.DiscriminantValue.Name.PascalCase.UnsafeName
		if unionType.Shape.SingleProperty != nil && unionType.Shape.SingleProperty.Type.Container != nil && unionType.Shape.SingleProperty.Type.Container.Literal != nil {
			// The constructor for a literal shouldn't take any arguments.
			literal := unionType.Shape.SingleProperty.Type.Container.Literal
			fieldName = unionType.DiscriminantValue.Name.CamelCase.SafeName
			t.writer.P("func New", t.typeName, "With", unionType.DiscriminantValue.Name.PascalCase.UnsafeName, "() *", t.typeName, "{")
			t.writer.P("return &", t.typeName, "{", discriminantName, ": \"", unionType.DiscriminantValue.WireValue, "\", ", fieldName, ": ", literalToValue(literal), "}")
		} else if t.unionVersion != UnionVersionV1 {
			singleUnionProperty := singleUnionTypePropertiesToGoType(unionType.Shape, t.writer.types, t.writer.scope, t.baseImportPath, t.importPath)
			t.writer.P("func New", t.typeName, "From", unionType.DiscriminantValue.Name.PascalCase.UnsafeName, "(value ", singleUnionProperty.goType, ") *", t.typeName, "{")
			t.writer.P("return &", t.typeName, "{", discriminantName, ": \"", unionType.DiscriminantValue.WireValue, "\", ", fieldName, ": value}")
		} else {
			continue
		}
		t.writer.P("}")
		t.writer.P()
	}

	receiver := typeNameToReceiver(t.typeName)

	// Implement the getter methods.
	for _, literal := range append(literals, unionLiterals...) {
		t.writer.P("func (", receiver, " *", t.typeName, ") ", literal.Name.Name.PascalCase.UnsafeName, "()", literalToGoType(literal.Value), "{")
		t.writer.P("return ", receiver, ".", literal.Name.Name.CamelCase.SafeName)
		t.writer.P("}")
		t.writer.P()
	}

	// Implement the json.Unmarshaler interface.
	t.writer.P("func (", receiver, " *", t.typeName, ") UnmarshalJSON(data []byte) error {")
	t.writer.P("var unmarshaler struct {")
	t.writer.P(discriminantName, " string `json:\"", union.Discriminant.WireValue, "\"`")
	var propertyNames []string
	for _, extend := range union.Extends {
		extendedObjectProperties := t.visitObjectProperties(
			t.writer.types[extend.TypeId].Shape.Object,
			true,  // includeJSONTags
			true,  // includeURLTags
			false, // includeOptionals
		)
		propertyNames = append(propertyNames, extendedObjectProperties.names...)
	}
	for _, property := range union.BaseProperties {
		if property.ValueType.Container != nil && property.ValueType.Container.Literal != nil {
			continue
		}
		propertyNames = append(propertyNames, property.Name.Name.PascalCase.UnsafeName)
		t.writer.P(property.Name.Name.PascalCase.UnsafeName, " ", typeReferenceToGoType(property.ValueType, t.writer.types, t.writer.scope, t.baseImportPath, t.importPath, false), jsonTagForType(property.Name.WireValue, property.ValueType, t.writer.types))
	}
	t.writer.P("}")
	t.writer.P("if err := json.Unmarshal(data, &unmarshaler); err != nil {")
	t.writer.P("return err")
	t.writer.P("}")

	// Set the union's type on the exported type, plus all of the other
	// extended and/or base properties.
	t.writer.P(receiver, ".", discriminantName, " = unmarshaler.", discriminantName)
	for _, propertyName := range propertyNames {
		t.writer.P(receiver, ".", propertyName, " = unmarshaler.", propertyName)
	}
	for _, literal := range literals {
		t.writer.P(receiver, ".", literal.Name.Name.CamelCase.SafeName, " = ", literalToValue(literal.Value))
	}

	// Generate the switch to unmarshal the appropriate type.
	t.writer.P("switch unmarshaler.", discriminantName, " {")
	for _, unionType := range union.Types {
		t.writer.P("case \"", unionType.DiscriminantValue.WireValue, "\":")
		if unionType.Shape.PropertiesType == "singleProperty" {
			if unionType.Shape.SingleProperty.Type.Container != nil && unionType.Shape.SingleProperty.Type.Container.Literal != nil {
				// We have a literal, so we need to set its value explicitly.
				literal := unionType.Shape.SingleProperty.Type.Container.Literal
				t.writer.P(receiver, ".", unionType.DiscriminantValue.Name.CamelCase.SafeName, " = ", literalToValue(literal))
				continue
			}
			// If the union is a single property, we need a separate unmarshaler.
			// We can't use the top-level unmarshaler because of potential property
			// serde name conflicts, e.g.
			//
			//  type unmarshaler struct {
			//    String string `json:"value"`
			//    Boolean bool  `json:"value"`
			//  }
			t.writer.P("var valueUnmarshaler struct {")
			singleUnionProperty := singleUnionTypePropertiesToGoType(unionType.Shape, t.writer.types, t.writer.scope, t.baseImportPath, t.importPath)
			t.writer.P(unionType.DiscriminantValue.Name.PascalCase.UnsafeName, " ", singleUnionProperty.valueMarshalerGoType, jsonTagForType(unionType.Shape.SingleProperty.Name.WireValue, unionType.Shape.SingleProperty.Type, t.writer.types))
			t.writer.P("}")
			t.writer.P("if err := json.Unmarshal(data, &valueUnmarshaler); err != nil {")
			t.writer.P("return err")
			t.writer.P("}")
			t.writer.P(receiver, ".", unionType.DiscriminantValue.Name.PascalCase.UnsafeName, " = valueUnmarshaler.", unionType.DiscriminantValue.Name.PascalCase.UnsafeName, singleUnionProperty.valueUnmarshalerMethodSuffix)
			continue
		}
		t.writer.P(singleUnionTypePropertiesToInitializer(unionType.Shape, t.writer.types, t.writer.scope, t.baseImportPath, t.importPath, unionType.DiscriminantValue.Name.PascalCase.UnsafeName, receiver))
		t.writer.P("if err := json.Unmarshal(data, &value); err != nil {")
		t.writer.P("return err")
		t.writer.P("}")
		t.writer.P(receiver, ".", unionType.DiscriminantValue.Name.PascalCase.UnsafeName, " = value")
	}
	t.writer.P("}")
	t.writer.P("return nil")
	t.writer.P("}")
	t.writer.P()

	// Implement the json.Marshaler interface.
	t.writer.P("func (", receiver, " ", t.typeName, ") MarshalJSON() ([]byte, error) {")
	if t.unionVersion != UnionVersionV1 {
		t.writer.P("switch ", receiver, ".", discriminantName, " {")
	}
	for i, unionType := range union.Types {
		if i == 0 && t.unionVersion != UnionVersionV1 {
			// Implement the default case first.
			t.writer.P("default:")
			t.writer.P("return nil, fmt.Errorf(\"invalid type %s in %T\", ", receiver, ".", discriminantName, ", ", receiver, ")")
		}
		var (
			isLiteral  bool
			isOptional bool
			date       *date
		)
		if unionType.Shape.SingleProperty != nil {
			isLiteral = isLiteralType(unionType.Shape.SingleProperty.Type, t.writer.types)
			isOptional = isOptionalType(unionType.Shape.SingleProperty.Type, t.writer.types)
			date = maybeDate(unionType.Shape.SingleProperty.Type, isOptional)
		}
		zeroValue := "nil"
		if unionType.Shape.PropertiesType == "singleProperty" {
			zeroValue = zeroValueForTypeReference(unionType.Shape.SingleProperty.Type, t.writer.types)
		}
		unionTypeValue := receiver + "." + unionType.DiscriminantValue.Name.PascalCase.UnsafeName
		if isLiteral {
			unionTypeValue = receiver + "." + unionType.DiscriminantValue.Name.CamelCase.SafeName
		}
		if t.unionVersion != UnionVersionV1 {
			t.writer.P("case \"", unionType.DiscriminantValue.WireValue, "\":")
		} else if date != nil && !isOptional {
			t.writer.P("if !", unionTypeValue, ".IsZero() {")
		} else {
			t.writer.P("if ", unionTypeValue, " != ", zeroValue, " {")
		}

		if unionType.Shape.PropertiesType == "samePropertiesAsObject" {
			t.writer.P(
				"return core.MarshalJSONWithExtraProperty(",
				receiver,
				".",
				unionType.DiscriminantValue.Name.PascalCase.UnsafeName+", ",
				fmt.Sprintf("%q", union.Discriminant.WireValue)+", ",
				fmt.Sprintf("%q", unionType.DiscriminantValue.WireValue)+")",
			)
			if t.unionVersion == UnionVersionV1 {
				// Close the if condition, if present.
				t.writer.P("}")
			}
			continue
		}

		t.writer.P("var marshaler = struct {")
		t.writer.P(discriminantName, " string `json:\"", union.Discriminant.WireValue, "\"`")
		// Include all of the extended and base properties.
		for _, extend := range union.Extends {
			_ = t.visitObjectProperties(
				t.writer.types[extend.TypeId].Shape.Object,
				true,  // includeJSONTags
				true,  // includeURLTags
				false, // includeOptionals
			)
		}
		for _, property := range union.BaseProperties {
			if property.ValueType.Container != nil && property.ValueType.Container.Literal != nil {
				continue
			}
			t.writer.P(property.Name.Name.PascalCase.UnsafeName, " ", typeReferenceToGoType(property.ValueType, t.writer.types, t.writer.scope, t.baseImportPath, t.importPath, false), jsonTagForType(property.Name.WireValue, property.ValueType, t.writer.types))
		}
		for _, literal := range literals {
			t.writer.P(literal.Name.Name.PascalCase.UnsafeName, " ", literalToGoType(literal.Value), " `json:\"", literal.Name.WireValue, "\"`")
		}
		singleUnionProperty := singleUnionTypePropertiesToGoType(unionType.Shape, t.writer.types, t.writer.scope, t.baseImportPath, t.importPath)
		typeName := singleUnionProperty.goType
		switch unionType.Shape.PropertiesType {
		case "singleProperty":
			t.writer.P(unionType.DiscriminantValue.Name.PascalCase.UnsafeName, " ", singleUnionProperty.valueMarshalerGoType, jsonTagForType(unionType.Shape.SingleProperty.Name.WireValue, unionType.Shape.SingleProperty.Type, t.writer.types))
		case "samePropertiesAsObject":
		case "noProperties":
			// For no properties, we always include the omitempty tag.
			t.writer.P(unionType.DiscriminantValue.Name.PascalCase.UnsafeName, " ", typeName, " `json:\"", unionType.DiscriminantValue.WireValue, ",omitempty\"`")
		default:
			return fmt.Errorf("%q unions are not supported yet", unionType.Shape.PropertiesType)
		}
		// Set all of the values in the marshaler.
		t.writer.P("}{")
		t.writer.P(discriminantName, ": \"", unionType.DiscriminantValue.WireValue, "\",")
		for _, propertyName := range propertyNames {
			t.writer.P(propertyName, ": ", receiver, ".", propertyName, ",")
		}
		for _, literal := range literals {
			t.writer.P(literal.Name.Name.PascalCase.UnsafeName, ": ", literalToValue(literal.Value), ",")
		}
		if unionType.Shape.SingleProperty != nil && unionType.Shape.SingleProperty.Type.Container != nil && unionType.Shape.SingleProperty.Type.Container.Literal != nil {
			literal := unionType.Shape.SingleProperty.Type.Container.Literal
			t.writer.P(unionType.DiscriminantValue.Name.PascalCase.UnsafeName, ": ", literalToValue(literal), ",")
		} else {
			marshalerFieldName := unionType.DiscriminantValue.Name.PascalCase.UnsafeName
			marshalerFieldValue := fmt.Sprintf("%s.%s", receiver, unionType.DiscriminantValue.Name.PascalCase.UnsafeName)
			if constructor := singleUnionProperty.valueMarshalerConstructor; constructor != "" {
				marshalerFieldValue = fmt.Sprintf("%s(%s)", constructor, marshalerFieldValue)
			}
			t.writer.P(marshalerFieldName, ": ", marshalerFieldValue, ",")
		}
		t.writer.P("}")
		t.writer.P("return json.Marshal(marshaler)")
		if t.unionVersion == UnionVersionV1 {
			// Close the if condition, if present.
			t.writer.P("}")
		}
	}
	if t.unionVersion != UnionVersionV1 {
		// Close the switch statement, if present.
		t.writer.P("}")
	} else {
		t.writer.P("return nil, fmt.Errorf(\"type %T does not define a non-empty union type\", ", receiver, ")")
	}
	t.writer.P("}")
	t.writer.P()

	// Generate the Visitor interface.
	t.writer.P("type ", t.typeName, "Visitor interface {")
	for _, unionType := range union.Types {
		singleUnionProperty := singleUnionTypePropertiesToGoType(unionType.Shape, t.writer.types, t.writer.scope, t.baseImportPath, t.importPath)
		t.writer.P("Visit", unionType.DiscriminantValue.Name.PascalCase.UnsafeName, "(", singleUnionProperty.goType, ") error")
	}
	t.writer.P("}")
	t.writer.P()

	// Generate the Accept method.
	t.writer.P("func (", receiver, " *", t.typeName, ") Accept(visitor ", t.typeName, "Visitor) error {")
	if t.unionVersion != UnionVersionV1 {
		// Close the switch statement, if present.
		t.writer.P("switch ", receiver, ".", discriminantName, "{")
	}
	for i, unionType := range union.Types {
		if i == 0 && t.unionVersion != UnionVersionV1 {
			// Implement the default case first.
			t.writer.P("default:")
			t.writer.P("return fmt.Errorf(\"invalid type %s in %T\", ", receiver, ".", discriminantName, ", ", receiver, ")")
		}
		var (
			isLiteral  bool
			isOptional bool
			date       *date
		)
		if unionType.Shape.SingleProperty != nil {
			isLiteral = isLiteralType(unionType.Shape.SingleProperty.Type, t.writer.types)
			isOptional = isOptionalType(unionType.Shape.SingleProperty.Type, t.writer.types)
			date = maybeDate(unionType.Shape.SingleProperty.Type, isOptional)
		}
		zeroValue := "nil"
		if unionType.Shape.PropertiesType == "singleProperty" {
			zeroValue = zeroValueForTypeReference(unionType.Shape.SingleProperty.Type, t.writer.types)
		}
		unionTypeValue := receiver + "." + unionType.DiscriminantValue.Name.PascalCase.UnsafeName
		if isLiteral {
			unionTypeValue = receiver + "." + unionType.DiscriminantValue.Name.CamelCase.SafeName
		}
		if t.unionVersion != UnionVersionV1 {
			t.writer.P("case \"", unionType.DiscriminantValue.WireValue, "\":")
		} else if date != nil && !isOptional {
			t.writer.P("if !", unionTypeValue, ".IsZero() {")
		} else {
			t.writer.P("if ", unionTypeValue, " != ", zeroValue, " {")
		}
		fieldName := unionType.DiscriminantValue.Name.PascalCase.UnsafeName
		if unionType.Shape.SingleProperty != nil && unionType.Shape.SingleProperty.Type.Container != nil && unionType.Shape.SingleProperty.Type.Container.Literal != nil {
			fieldName = unionType.DiscriminantValue.Name.CamelCase.SafeName
		}
		t.writer.P("return visitor.Visit", unionType.DiscriminantValue.Name.PascalCase.UnsafeName, "(", receiver, ".", fieldName, ")")
		if t.unionVersion == UnionVersionV1 {
			// Close the if condition, if present.
			t.writer.P("}")
		}
	}
	if t.unionVersion != UnionVersionV1 {
		// Close the switch statement, if present.
		t.writer.P("}")
	} else {
		t.writer.P("return fmt.Errorf(\"type %T does not define a non-empty union type\", ", receiver, ")")
	}
	t.writer.P("}")
	t.writer.P()

	return nil
}

func (t *typeVisitor) VisitUndiscriminatedUnion(union *ir.UndiscriminatedUnionTypeDeclaration) error {
	receiver := typeNameToReceiver(t.typeName)

	// member represents a single undiscriminated union member.
	//
	// We define a separate struct here so that we can collect
	// all of the relevant information upfront, and traverse it
	// multiple times seamlessly (and in the order they're specified).
	type member struct {
		typeName   string
		caseName   string
		field      string
		variable   string
		value      string
		zeroValue  string
		docs       *string
		literal    string
		isLiteral  bool
		isOptional bool
		date       *date

		// Optional; only applies to date[-time] values.
		valueMarshalerValue          string
		valueUnmarshalerTypeName     string
		valueUnmarshalerMethodSuffix string
	}
	var members []*member
	var hasLiteral bool
	for _, unionMember := range union.Members {
		field := typeReferenceToUndiscriminatedUnionField(unionMember.Type, t.writer.types)
		var typeName string
		if unionMember.Type.Named != nil {
			typeName = unionMember.Type.Named.TypeId
		}
		var literal string
		isLiteral := isLiteralType(unionMember.Type, t.writer.types)
		if isLiteral {
			literal = literalToValue(unionMember.Type.Container.Literal)
		}
		hasLiteral = hasLiteral || isLiteral

		isOptional := isOptionalType(unionMember.Type, t.writer.types)
		date := maybeDate(unionMember.Type, isOptional)

		var (
			valueMarshalerValue          = ""
			valueUnmarshalerTypeName     = ""
			valueUnmarshalerMethodSuffix = ""
		)
		if date != nil {
			valueMarshalerValue = fmt.Sprintf("%s(%s.%s)", date.Constructor, receiver, field)
			valueUnmarshalerTypeName = date.TypeDeclaration
			valueUnmarshalerMethodSuffix = fmt.Sprintf(".%s", date.TimeMethod)

		}

		members = append(
			members,
			&member{
				typeName:                     typeName,
				field:                        field,
				variable:                     fmt.Sprintf("value%s", strings.Title(field)),
				caseName:                     firstLetterToLower(field),
				value:                        typeReferenceToGoType(unionMember.Type, t.writer.types, t.writer.scope, t.baseImportPath, t.importPath, false),
				zeroValue:                    zeroValueForTypeReference(unionMember.Type, t.writer.types),
				docs:                         unionMember.Docs,
				literal:                      literal,
				isLiteral:                    isLiteral,
				isOptional:                   isOptional,
				date:                         date,
				valueMarshalerValue:          valueMarshalerValue,
				valueUnmarshalerTypeName:     valueUnmarshalerTypeName,
				valueUnmarshalerMethodSuffix: valueUnmarshalerMethodSuffix,
			},
		)
	}

	// Write the union type definition.
	t.writer.P("type ", t.typeName, " struct {")
	for _, member := range members {
		t.writer.WriteDocs(member.docs)
		t.writer.P(member.field, " ", member.value)
	}
	t.writer.P("}")
	t.writer.P()

	// Implement the constructors. If UnionVersionV1 is enabled, we only generate
	// constructors for literal values.
	for _, member := range members {
		if member.isLiteral {
			t.writer.P("func New", t.typeName, "With", strings.Title(member.field), "() *", t.typeName, "{")
			t.writer.P("return &", t.typeName, "{", member.field, ": ", member.literal, "}")
		} else if t.unionVersion != UnionVersionV1 {
			t.writer.P("func New", t.typeName, "From", member.field, "(value ", member.value, ") *", t.typeName, "{")
			t.writer.P("return &", t.typeName, "{", member.field, ": value}")
		} else {
			continue
		}
		t.writer.P("}")
		t.writer.P()
	}

	// Write getters for literal values, if any.
	for _, member := range members {
		if !member.isLiteral {
			continue
		}
		t.writer.P("func (", receiver, " *", t.typeName, ") ", strings.Title(member.field), "() ", member.value, "{")
		t.writer.P("return ", receiver, ".", member.field)
		t.writer.P("}")
		t.writer.P()
	}

	// Implement the json.Unmarshaler interface.
	t.writer.P("func (", receiver, " *", t.typeName, ") UnmarshalJSON(data []byte) error {")
	for _, member := range members {
		value := member.value
		if member.valueUnmarshalerTypeName != "" {
			value = member.valueUnmarshalerTypeName
		}
		format := "var " + member.variable + " %s"
		if member.typeName != "" && isPointer(t.writer.types[member.typeName]) {
			format = member.variable + " := new(%s)"
			value = strings.TrimLeft(value, "*")
		}
		t.writer.P(fmt.Sprintf(format, value))
		t.writer.P("if err := json.Unmarshal(data, &", member.variable, "); err == nil {")
		if member.isLiteral {
			// If the undiscriminated union specifies a literal, it will only
			// succeed if the literal matches exactly.
			t.writer.P("if ", member.variable, "== ", member.literal, " {")
			t.writer.P(receiver, ".", member.field, " = ", member.variable)
			t.writer.P("return nil")
			t.writer.P("}")
			t.writer.P("}")
			continue
		}
		variable := member.variable
		if member.valueUnmarshalerMethodSuffix != "" {
			variable += member.valueUnmarshalerMethodSuffix
		}
		t.writer.P(receiver, ".", member.field, " = ", variable)
		t.writer.P("return nil")
		t.writer.P("}")
	}
	t.writer.P(`return fmt.Errorf("%s cannot be deserialized as a %T", data, `, receiver, ")")
	t.writer.P("}")
	t.writer.P()

	t.writer.P("func (", receiver, " ", t.typeName, ") MarshalJSON() ([]byte, error) {")
	for _, member := range members {
		field := fmt.Sprintf("%s.%s", receiver, member.field)
		if member.date != nil && !member.isOptional {
			t.writer.P("if !", field, ".IsZero() {")
		} else {
			t.writer.P("if ", field, " != ", member.zeroValue, " {")
		}
		if member.isLiteral {
			// If we have a literal, we need to marshal it directly.
			t.writer.P("return json.Marshal(", member.literal, ")")
			t.writer.P("}")
			continue
		}
		if member.date != nil {
			t.writer.P("return json.Marshal(", member.date.Constructor, "(", field, "))")
		} else {
			t.writer.P("return json.Marshal(", field, ")")
		}
		t.writer.P("}")
	}
	t.writer.P("return nil, fmt.Errorf(\"type %T does not include a non-empty union type\", ", receiver, ")")
	t.writer.P("}")
	t.writer.P()

	// Generate the Visitor interface.
	t.writer.P("type ", t.typeName, "Visitor interface {")
	for _, member := range members {
		t.writer.P("Visit", strings.Title(member.field), "(", member.value, ") error")
	}
	t.writer.P("}")
	t.writer.P()

	// Generate the Accept method.
	t.writer.P("func (", receiver, " *", t.typeName, ") Accept(visitor ", t.typeName, "Visitor) error {")
	for _, member := range members {
		field := fmt.Sprintf("%s.%s", receiver, member.field)
		if member.date != nil && !member.isOptional {
			t.writer.P("if !", field, ".IsZero() {")
		} else {
			t.writer.P("if ", field, " != ", member.zeroValue, " {")
		}
		t.writer.P("return visitor.Visit", strings.Title(member.field), "(", receiver, ".", member.field, ")")
		t.writer.P("}")
	}
	t.writer.P("return fmt.Errorf(\"type %T does not include a non-empty union type\", ", receiver, ")")
	t.writer.P("}")
	t.writer.P()

	return nil
}

// undiscriminatedUnionTypeReferenceVisitor retrieves the string representation of type references
// (e.g. containers, primitives, etc), but specifically for undiscriminated union generation.
type undiscriminatedUnionTypeReferenceVisitor struct {
	value string
	types map[ir.TypeId]*ir.TypeDeclaration
}

// Compile-time assertion.
var _ ir.TypeReferenceVisitor = (*undiscriminatedUnionTypeReferenceVisitor)(nil)

func (u *undiscriminatedUnionTypeReferenceVisitor) VisitContainer(container *ir.ContainerType) error {
	u.value = containerToUndiscriminatedUnionField(container, u.types)
	return nil
}

func (u *undiscriminatedUnionTypeReferenceVisitor) VisitNamed(named *ir.DeclaredTypeName) error {
	u.value = named.Name.PascalCase.UnsafeName
	return nil
}

func (u *undiscriminatedUnionTypeReferenceVisitor) VisitPrimitive(primitive ir.PrimitiveType) error {
	u.value = primitiveToUndiscriminatedUnionField(primitive)
	return nil
}

func (u *undiscriminatedUnionTypeReferenceVisitor) VisitUnknown(unknown any) error {
	u.value = "Unknown"
	return nil
}

// undiscriminatedUnionContainerTypeVisitor retrieves the string representation of container types
// (e.g. lists, maps, etc).
type undiscriminatedUnionContainerTypeVisitor struct {
	value string
	types map[ir.TypeId]*ir.TypeDeclaration
}

// Compile-time assertion.
var _ ir.ContainerTypeVisitor = (*undiscriminatedUnionContainerTypeVisitor)(nil)

func (u *undiscriminatedUnionContainerTypeVisitor) VisitList(list *ir.TypeReference) error {
	u.value = fmt.Sprintf("%sList", typeReferenceToUndiscriminatedUnionField(list, u.types))
	return nil
}

func (u *undiscriminatedUnionContainerTypeVisitor) VisitMap(mapType *ir.MapType) error {
	u.value = fmt.Sprintf(
		"%s%sMap",
		typeReferenceToUndiscriminatedUnionField(mapType.KeyType, u.types),
		typeReferenceToUndiscriminatedUnionField(mapType.ValueType, u.types),
	)
	return nil
}

func (u *undiscriminatedUnionContainerTypeVisitor) VisitOptional(optional *ir.TypeReference) error {
	u.value = fmt.Sprintf("%sOptional", typeReferenceToUndiscriminatedUnionField(optional, u.types))
	return nil
}

func (u *undiscriminatedUnionContainerTypeVisitor) VisitSet(set *ir.TypeReference) error {
	u.value = fmt.Sprintf("%sSet", typeReferenceToUndiscriminatedUnionField(set, u.types))
	return nil
}

func (u *undiscriminatedUnionContainerTypeVisitor) VisitLiteral(literal *ir.Literal) error {
	u.value = fmt.Sprintf("%sLiteral", literalToUndiscriminatedUnionField(literal))
	return nil
}

type objectProperties struct {
	names    []string
	literals []*literal
	dates    []*date
}

// date contains the information required to generate code for date and date-time
// properties.
type date struct {
	Name            *ir.NameAndWireValue
	ValueType       *ir.TypeReference
	Constructor     string
	TimeMethod      string
	TypeDeclaration string
	StructTag       string
	IsOptional      bool
	IsDateTime      bool
}

// literal contains the information required to generate code for literal properties.
type literal struct {
	Name  *ir.NameAndWireValue
	Value *ir.Literal
}

// visitObjectProperties writes all of this object's properties, and recursively calls itself with
// the object's extended properties (if any). The 'includeJSONTags' parameter controls whether or not
// to generate JSON struct tags, which is only relevant for object types (not unions).
//
// A slice of all the transitive property names, as well as a sentinel value that signals whether
// any of the properties are a literal value, are returned.
func (t *typeVisitor) visitObjectProperties(
	object *ir.ObjectTypeDeclaration,
	includeJSONTags bool,
	includeURLTags bool,
	includeOptionals bool,
) *objectProperties {
	var (
		names    []string
		literals []*literal
		dates    []*date
	)
	for _, extend := range object.Extends {
		// You can only extend other objects.
		extendedObjectProperties := t.visitObjectProperties(t.writer.types[extend.TypeId].Shape.Object, includeJSONTags, includeURLTags, includeOptionals)
		names = append(names, extendedObjectProperties.names...)
		literals = append(literals, extendedObjectProperties.literals...)
		dates = append(dates, extendedObjectProperties.dates...)
	}
	for _, property := range object.Properties {
		t.writer.WriteDocs(property.Docs)
		if property.ValueType.Container != nil && property.ValueType.Container.Literal != nil {
			literals = append(literals, &literal{Name: property.Name, Value: property.ValueType.Container.Literal})
			continue
		}
		if date := maybeDateProperty(property.ValueType, property.Name, false); date != nil {
			dates = append(dates, date)
		}
		names = append(names, property.Name.Name.PascalCase.UnsafeName)
		goType := typeReferenceToGoType(property.ValueType, t.writer.types, t.writer.scope, t.baseImportPath, t.importPath, includeOptionals)
		if includeJSONTags {
			var structTag string
			if includeURLTags {
				structTag = fullFieldTagForType(property.Name.WireValue, property.ValueType, t.writer.types)
			} else {
				structTag = fullFieldTagForTypeWithIgnoredURL(property.Name.WireValue, property.ValueType, t.writer.types)
			}
			t.writer.P(property.Name.Name.PascalCase.UnsafeName, " ", goType, structTag)
			continue
		}
		t.writer.P(property.Name.Name.PascalCase.UnsafeName, " ", goType)
	}
	return &objectProperties{
		names:    names,
		literals: literals,
		dates:    dates,
	}
}

// typeReferenceVisitor retrieves the string representation of type references
// (e.g. containers, primitives, etc).
type typeReferenceVisitor struct {
	value            string
	baseImportPath   string
	importPath       string
	scope            *gospec.Scope
	types            map[ir.TypeId]*ir.TypeDeclaration
	includeOptionals bool
}

// Compile-time assertion.
var _ ir.TypeReferenceVisitor = (*typeReferenceVisitor)(nil)

func (t *typeReferenceVisitor) VisitContainer(container *ir.ContainerType) error {
	t.value = containerTypeToGoType(container, t.types, t.scope, t.baseImportPath, t.importPath, t.includeOptionals)
	return nil
}

func (t *typeReferenceVisitor) VisitNamed(named *ir.DeclaredTypeName) error {
	format := "%s"
	if isPointer(t.types[named.TypeId]) {
		format = "*%s"
	}
	name := named.Name.PascalCase.UnsafeName
	if importPath := fernFilepathToImportPath(t.baseImportPath, named.FernFilepath); importPath != t.importPath {
		name = t.scope.AddImport(importPath) + "." + name
	}
	t.value = fmt.Sprintf(format, name)
	return nil
}

func (t *typeReferenceVisitor) VisitPrimitive(primitive ir.PrimitiveType) error {
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
	value            string
	baseImportPath   string
	importPath       string
	scope            *gospec.Scope
	types            map[ir.TypeId]*ir.TypeDeclaration
	includeOptionals bool
}

// Compile-time assertion.
var _ ir.ContainerTypeVisitor = (*containerTypeVisitor)(nil)

func (c *containerTypeVisitor) VisitList(list *ir.TypeReference) error {
	c.value = fmt.Sprintf("[]%s", typeReferenceToGoType(list, c.types, c.scope, c.baseImportPath, c.importPath, false))
	return nil
}

func (c *containerTypeVisitor) VisitMap(mapType *ir.MapType) error {
	c.value = fmt.Sprintf("map[%s]%s", typeReferenceToGoType(mapType.KeyType, c.types, c.scope, c.baseImportPath, c.importPath, false), typeReferenceToGoType(mapType.ValueType, c.types, c.scope, c.baseImportPath, c.importPath, false))
	return nil
}

func (c *containerTypeVisitor) VisitOptional(optional *ir.TypeReference) error {
	// Trim all of the preceding pointers from the underlying type so that we don't
	// unnecessarily generate double pointers for objects and unions (e.g. '**Foo)').
	//
	// We also don't want to specify pointers for any container types because those
	// values are already nil-able.
	value := strings.TrimLeft(typeReferenceToGoType(optional, c.types, c.scope, c.baseImportPath, c.importPath, c.includeOptionals), "*")
	if c.includeOptionals {
		c.value = fmt.Sprintf("*core.Optional[%s]", value)
		return nil
	}
	if optional.Unknown != nil || (optional.Container != nil && optional.Container.Literal == nil) {
		c.value = value
		return nil
	}
	c.value = fmt.Sprintf("*%s", value)
	return nil
}

func (c *containerTypeVisitor) VisitSet(set *ir.TypeReference) error {
	c.value = fmt.Sprintf("[]%s", typeReferenceToGoType(set, c.types, c.scope, c.baseImportPath, c.importPath, false))
	return nil
}

func (c *containerTypeVisitor) VisitLiteral(literal *ir.Literal) error {
	c.value = literalToGoType(literal)
	return nil
}

// singleUnionTypePropertiesVisitor retrieves the string representation of
// single union type properties.
type singleUnionTypePropertiesVisitor struct {
	goType                       string
	valueMarshalerGoType         string
	valueMarshalerConstructor    string
	valueUnmarshalerMethodSuffix string

	baseImportPath string
	importPath     string
	scope          *gospec.Scope
	types          map[ir.TypeId]*ir.TypeDeclaration
}

// Compile-time assertion.
var _ ir.SingleUnionTypePropertiesVisitor = (*singleUnionTypePropertiesVisitor)(nil)

func (c *singleUnionTypePropertiesVisitor) VisitSamePropertiesAsObject(named *ir.DeclaredTypeName) error {
	format := "%s"
	if isPointer(c.types[named.TypeId]) {
		format = "*%s"
	}
	name := named.Name.PascalCase.UnsafeName
	if importPath := fernFilepathToImportPath(c.baseImportPath, named.FernFilepath); importPath != c.importPath {
		name = c.scope.AddImport(importPath) + "." + name
	}
	c.goType = fmt.Sprintf(format, name)
	c.valueMarshalerGoType = c.goType
	return nil
}

func (c *singleUnionTypePropertiesVisitor) VisitSingleProperty(property *ir.SingleUnionTypeProperty) error {
	c.goType = typeReferenceToGoType(property.Type, c.types, c.scope, c.baseImportPath, c.importPath, false)

	if date := maybeDateProperty(property.Type, property.Name, false); date != nil {
		c.valueMarshalerGoType = date.TypeDeclaration
		c.valueMarshalerConstructor = date.Constructor
		c.valueUnmarshalerMethodSuffix = fmt.Sprintf(".%s", date.TimeMethod)
		return nil
	}

	c.valueMarshalerGoType = c.goType
	return nil
}

func (c *singleUnionTypePropertiesVisitor) VisitNoProperties(_ any) error {
	c.goType = "interface{}"
	c.valueMarshalerGoType = c.goType
	return nil
}

// singleUnionTypePropertiesInitializerVisitor retrieves the string representation of
// single union type property initializers.
//
// This visitor determines the string representation of the constructor used
// in the json.Unmarshaler implementation.
type singleUnionTypePropertiesInitializerVisitor struct {
	value            string
	discriminantName string
	receiver         string
	baseImportPath   string
	importPath       string
	scope            *gospec.Scope
	types            map[ir.TypeId]*ir.TypeDeclaration
}

// Compile-time assertion.
var _ ir.SingleUnionTypePropertiesVisitor = (*singleUnionTypePropertiesInitializerVisitor)(nil)

func (c *singleUnionTypePropertiesInitializerVisitor) VisitSamePropertiesAsObject(named *ir.DeclaredTypeName) error {
	format := "var value %s"
	if isPointer(c.types[named.TypeId]) {
		format = "value := new(%s)"
	}
	name := named.Name.PascalCase.UnsafeName
	if importPath := fernFilepathToImportPath(c.baseImportPath, named.FernFilepath); importPath != c.importPath {
		name = c.scope.AddImport(importPath) + "." + name
	}
	c.value = fmt.Sprintf(format, name)
	return nil
}

func (c *singleUnionTypePropertiesInitializerVisitor) VisitSingleProperty(_ *ir.SingleUnionTypeProperty) error {
	c.value = fmt.Sprintf("%s.%s = unmarshaler.%s", c.receiver, c.discriminantName, c.discriminantName)
	return nil
}

func (c *singleUnionTypePropertiesInitializerVisitor) VisitNoProperties(_ any) error {
	c.value = "value := make(map[string]interface{})"
	return nil
}

// literalValueVisitor retrieves the string representation of the literal value.
// Strings are the only supported literals for now.
type literalValueVisitor struct {
	value string
}

// Compile-time assertion.
var _ ir.LiteralVisitor = (*literalValueVisitor)(nil)

func (l *literalValueVisitor) VisitBoolean(value bool) error {
	l.value = strconv.FormatBool(value)
	return nil
}

func (l *literalValueVisitor) VisitString(value string) error {
	l.value = fmt.Sprintf("%q", value)
	return nil
}

// literalTypeVisitor retrieves the string representation of the literal's type.
// Strings are the only supported literals for now.
type literalTypeVisitor struct {
	value string
}

// Compile-time assertion.
var _ ir.LiteralVisitor = (*literalTypeVisitor)(nil)

func (l *literalTypeVisitor) VisitBoolean(_ bool) error {
	l.value = "bool"
	return nil
}

func (l *literalTypeVisitor) VisitString(_ string) error {
	l.value = "string"
	return nil
}

// typeReferenceToGoType maps the given type reference into its Go-equivalent.
func typeReferenceToGoType(
	typeReference *ir.TypeReference,
	types map[ir.TypeId]*ir.TypeDeclaration,
	scope *gospec.Scope,
	baseImportPath string,
	importPath string,
	includeOptionals bool,
) string {
	visitor := &typeReferenceVisitor{
		baseImportPath:   baseImportPath,
		importPath:       importPath,
		scope:            scope,
		types:            types,
		includeOptionals: includeOptionals,
	}
	_ = typeReference.Accept(visitor)
	return visitor.value
}

// containerTypeToGoType maps the given container type into its Go-equivalent.
func containerTypeToGoType(
	containerType *ir.ContainerType,
	types map[ir.TypeId]*ir.TypeDeclaration,
	scope *gospec.Scope,
	baseImportPath string,
	importPath string,
	includeOptionals bool,
) string {
	visitor := &containerTypeVisitor{
		baseImportPath:   baseImportPath,
		importPath:       importPath,
		scope:            scope,
		types:            types,
		includeOptionals: includeOptionals,
	}
	_ = containerType.Accept(visitor)
	return visitor.value
}

type singleUnionProperty struct {
	goType               string
	valueMarshalerGoType string

	// Optional; required for date[-time] properties.
	valueMarshalerConstructor    string
	valueUnmarshalerMethodSuffix string
}

// singleUnionTypePropertiesToGoType maps the given container type into its Go-equivalent.
func singleUnionTypePropertiesToGoType(
	singleUnionTypeProperties *ir.SingleUnionTypeProperties,
	types map[ir.TypeId]*ir.TypeDeclaration,
	scope *gospec.Scope,
	baseImportPath string,
	importPath string,
) *singleUnionProperty {
	visitor := &singleUnionTypePropertiesVisitor{
		baseImportPath: baseImportPath,
		importPath:     importPath,
		scope:          scope,
		types:          types,
	}
	_ = singleUnionTypeProperties.Accept(visitor)
	return &singleUnionProperty{
		goType:                       visitor.goType,
		valueMarshalerGoType:         visitor.valueMarshalerGoType,
		valueMarshalerConstructor:    visitor.valueMarshalerConstructor,
		valueUnmarshalerMethodSuffix: visitor.valueUnmarshalerMethodSuffix,
	}
}

// singleUnionTypePropertiesToInitializer maps the given container type into its Go-equivalent initializer.
//
// Note this returns the string representation of the statement required to initialize
// the given property, e.g. 'value := new(Foo)'
func singleUnionTypePropertiesToInitializer(
	singleUnionTypeProperties *ir.SingleUnionTypeProperties,
	types map[ir.TypeId]*ir.TypeDeclaration,
	scope *gospec.Scope,
	baseImportPath string,
	importPath string,
	discriminantName string,
	receiver string,
) string {
	visitor := &singleUnionTypePropertiesInitializerVisitor{
		discriminantName: discriminantName,
		receiver:         receiver,
		baseImportPath:   baseImportPath,
		importPath:       importPath,
		scope:            scope,
		types:            types,
	}
	_ = singleUnionTypeProperties.Accept(visitor)
	return visitor.value
}

func writeExtractExtraProperties(
	f *fileWriter,
	literals []*literal,
	receiver string,
	extraPropertiesFieldName string,
) {
	var exclude string
	if len(literals) > 0 {
		for _, literal := range literals {
			exclude += fmt.Sprintf("%q", literal.Name.WireValue) + ", "
		}
		exclude = ", " + exclude
	}
	f.P("extraProperties, err := core.ExtractExtraProperties(data, *", receiver, exclude, ")")
	f.P("if err != nil {")
	f.P("return err")
	f.P("}")
	f.P(receiver, ".", extraPropertiesFieldName, " = extraProperties")
	f.P()
}

// typeReferenceToUndiscriminatedUnionField maps Fern's type references to the field name used in an
// undiscriminated union.
func typeReferenceToUndiscriminatedUnionField(typeReference *ir.TypeReference, types map[ir.TypeId]*ir.TypeDeclaration) string {
	visitor := &undiscriminatedUnionTypeReferenceVisitor{
		types: types,
	}
	_ = typeReference.Accept(visitor)
	return visitor.value
}

// containerToUndiscriminatedUnionField maps Fern's container types to the field name used in an
// undiscriminated union.
func containerToUndiscriminatedUnionField(container *ir.ContainerType, types map[ir.TypeId]*ir.TypeDeclaration) string {
	visitor := &undiscriminatedUnionContainerTypeVisitor{
		types: types,
	}
	_ = container.Accept(visitor)
	return visitor.value
}

// literalToGoType maps the given literal into its Go-equivalent.
func literalToGoType(literal *ir.Literal) string {
	visitor := new(literalTypeVisitor)
	_ = literal.Accept(visitor)
	return visitor.value
}

// literalToValue maps the given literal into its value.
func literalToValue(literal *ir.Literal) string {
	visitor := new(literalValueVisitor)
	_ = literal.Accept(visitor)
	return visitor.value
}

// fernFilepathToImportPath maps the given Fern filepath to its
// Go import path.
func fernFilepathToImportPath(baseImportPath string, fernFilepath *ir.FernFilepath) string {
	var packages []string
	for _, packageName := range fernFilepath.PackagePath {
		packages = append(packages, strings.ToLower(packageName.CamelCase.SafeName))
	}
	return packagePathToImportPath(baseImportPath, packages)
}

// packagePathToImportPath maps the given packagePath to its Go import path.
func packagePathToImportPath(baseImportPath string, packagePath []string) string {
	return path.Join(append([]string{baseImportPath}, packagePath...)...)
}

// isPointer returns true if the given type is a pointer type (e.g. objects and
// unions). Enums, primitives, and aliases of these types do not require pointers.
func isPointer(typeDeclaration *ir.TypeDeclaration) bool {
	switch typeDeclaration.Shape.Type {
	case "object", "union", "undiscriminatedUnion":
		return true
	case "alias", "enum", "primitive":
		return false
	}
	// Unreachable.
	return false
}

// typeNameToReceiver returns the receiver name for
// the given type name. This is just the lowercase
// equivalent of the first character.
func typeNameToReceiver(typeName string) string {
	if len(typeName) == 0 {
		return typeName
	}
	r := []rune(typeName)
	return string(unicode.ToLower(r[0]))
}

// firstLetterToLower returns the given string with its
// first letter lowercased.
func firstLetterToLower(s string) string {
	if len(s) == 0 {
		return s
	}
	r := []rune(s)
	r[0] = unicode.ToLower(r[0])
	return string(r)
}

// fullFieldTagForType returns the JSON struct tag and query URL struct tag for the given type.
func fullFieldTagForType(wireValue string, valueType *ir.TypeReference, types map[ir.TypeId]*ir.TypeDeclaration) string {
	return structTagForType(
		wireValue,
		valueType,
		types,
		[]string{"json", "url"},
		nil,
	)
}

func fullFieldTagForTypeWithIgnoredURL(wireValue string, valueType *ir.TypeReference, types map[ir.TypeId]*ir.TypeDeclaration) string {
	return structTagForType(
		wireValue,
		valueType,
		types,
		[]string{"json"},
		[]string{"url"},
	)
}

// jsonTagForType returns the JSON struct tag for the given type.
func jsonTagForType(wireValue string, valueType *ir.TypeReference, types map[ir.TypeId]*ir.TypeDeclaration) string {
	return structTagForType(
		wireValue,
		valueType,
		types,
		[]string{"json"},
		nil,
	)
}

// urlTagForType returns the query URL struct tag for the given type. The URL tag
// requires special handling because we need to always set the JSON tag to '-'.
func urlTagForType(wireValue string, valueType *ir.TypeReference, types map[ir.TypeId]*ir.TypeDeclaration) string {
	tagFormat := tagFormatForType(valueType, types)
	structTags := []string{
		`json:"-"`,
	}
	structTags = append(structTags, fmt.Sprintf(tagFormat, "url", wireValue))
	if formatStructTag := maybeFormatStructTag(valueType); formatStructTag != "" {
		structTags = append(structTags, formatStructTag)
	}
	return fmt.Sprintf("`%s`", strings.Join(structTags, " "))
}

// structTagForType returns the struct tag associated with the given type, setting the given tags. If the value type
// is a required primitive, then we don't include the omitempty tag so that the default values can be explicitly sent
// (e.g. "false" for bools).
func structTagForType(
	wireValue string,
	valueType *ir.TypeReference,
	types map[ir.TypeId]*ir.TypeDeclaration,
	tags []string,
	ignoreTags []string,
) string {
	tagFormat := tagFormatForType(valueType, types)
	var structTags []string
	for _, tag := range tags {
		structTags = append(structTags, fmt.Sprintf(tagFormat, tag, wireValue))
	}
	for _, tag := range ignoreTags {
		structTags = append(structTags, fmt.Sprintf(`%s:"-"`, tag))
	}
	if formatStructTag := maybeFormatStructTag(valueType); formatStructTag != "" {
		structTags = append(structTags, formatStructTag)
	}
	if len(structTags) == 0 {
		return ""
	}
	return fmt.Sprintf("`%s`", strings.Join(structTags, " "))
}

// tagFormatForType returns the string format string for the given type's struct tag.
func tagFormatForType(
	valueType *ir.TypeReference,
	types map[ir.TypeId]*ir.TypeDeclaration,
) string {
	if valueType != nil {
		primitive := valueType.Primitive
		if valueType.Named != nil {
			typeDeclaration := types[valueType.Named.TypeId]
			if typeDeclaration.Shape.Enum != nil {
				return "%s:%q"
			}
			// If the type is an alias, we need to check if it's an alias to a primitive.
			if typeDeclaration.Shape.Alias != nil {
				primitive = typeDeclaration.Shape.Alias.AliasOf.Primitive
			}
		}
		if primitive != "" {
			return "%s:%q"
		}
	}
	return `%s:"%s,omitempty"`
}

func getExtraPropertiesFieldName(extraPropertiesEnabled bool) string {
	if extraPropertiesEnabled {
		return "ExtraProperties"
	}
	return "extraProperties"

}

// unknownToGoType maps the given unknown into its Go-equivalent.
func unknownToGoType(_ any) string {
	return "interface{}"
}

// literalToUndiscriminatedUnionField maps Fern's literal types to the field name used in an
// undiscriminated union.
func literalToUndiscriminatedUnionField(literal *ir.Literal) string {
	switch literal.Type {
	case "boolean":
		return fmt.Sprintf("%vBool", literal.Boolean)
	case "string":
		return fmt.Sprintf("%sString", literal.String)
	default:
		return "unknown"
	}
}

// primitiveToGoType maps Fern's primitive types to their Go-equivalent.
func primitiveToGoType(primitive ir.PrimitiveType) string {
	switch primitive {
	case ir.PrimitiveTypeInteger:
		return "int"
	case ir.PrimitiveTypeDouble:
		return "float64"
	case ir.PrimitiveTypeString:
		return "string"
	case ir.PrimitiveTypeBoolean:
		return "bool"
	case ir.PrimitiveTypeLong:
		return "int64"
	case ir.PrimitiveTypeDateTime:
		return "time.Time"
	case ir.PrimitiveTypeDate:
		return "time.Time"
	case ir.PrimitiveTypeUuid:
		return "uuid.UUID"
	case ir.PrimitiveTypeBase64:
		return "[]byte"
	default:
		return "interface{}"
	}
}

// primitiveToUndiscriminatedUnionField maps Fern's primitive types to the field name used in an
// undiscriminated union.
func primitiveToUndiscriminatedUnionField(primitive ir.PrimitiveType) string {
	switch primitive {
	case ir.PrimitiveTypeInteger:
		return "Integer"
	case ir.PrimitiveTypeDouble:
		return "Double"
	case ir.PrimitiveTypeString:
		return "String"
	case ir.PrimitiveTypeBoolean:
		return "Boolean"
	case ir.PrimitiveTypeLong:
		return "Long"
	case ir.PrimitiveTypeDateTime:
		return "DateTime"
	case ir.PrimitiveTypeDate:
		return "Date"
	case ir.PrimitiveTypeUuid:
		return "Uuid"
	case ir.PrimitiveTypeBase64:
		return "Base64"
	default:
		return "Any"
	}
}

// mayybeDateProperty returns the *date associated with the given type reference, if any.
func maybeDateProperty(valueType *ir.TypeReference, name *ir.NameAndWireValue, isOptional bool) *date {
	if valueType.Primitive == ir.PrimitiveTypeDate {
		var (
			typeDeclaration = "*core.Date"
			constructor     = "core.NewDate"
			timeMethod      = "Time()"
			structTag       = fmt.Sprintf("`json:%q`", name.WireValue)
		)
		if isOptional {
			constructor = "core.NewOptionalDate"
			timeMethod = "TimePtr()"
			structTag = fmt.Sprintf("`json:\"%s,omitempty\"`", name.WireValue)
		}
		return &date{
			Name:            name,
			ValueType:       valueType,
			Constructor:     constructor,
			TimeMethod:      timeMethod,
			TypeDeclaration: typeDeclaration,
			StructTag:       structTag,
			IsOptional:      isOptional,
		}
	}
	if valueType.Primitive == ir.PrimitiveTypeDateTime {
		var (
			typeDeclaration = "*core.DateTime"
			constructor     = "core.NewDateTime"
			timeMethod      = "Time()"
			structTag       = fmt.Sprintf("`json:%q`", name.WireValue)
		)
		if isOptional {
			constructor = "core.NewOptionalDateTime"
			timeMethod = "TimePtr()"
			structTag = fmt.Sprintf("`json:\"%s,omitempty\"`", name.WireValue)
		}
		return &date{
			Name:            name,
			ValueType:       valueType,
			Constructor:     constructor,
			TimeMethod:      timeMethod,
			TypeDeclaration: typeDeclaration,
			StructTag:       structTag,
			IsOptional:      isOptional,
			IsDateTime:      true,
		}
	}
	if valueType.Container != nil && valueType.Container.Optional != nil {
		return maybeDateProperty(valueType.Container.Optional, name, true)
	}
	return nil
}

// maybeDate retrieves the type information for the given date, excluding
// any property-oriented information. This is tailored to the undiscriminated
// union use case.
func maybeDate(valueType *ir.TypeReference, isOptional bool) *date {
	if valueType.Primitive == ir.PrimitiveTypeDate {
		var (
			typeDeclaration = "*core.Date"
			constructor     = "core.NewDate"
			timeMethod      = "Time()"
		)
		if isOptional {
			constructor = "core.NewOptionalDate"
			timeMethod = "TimePtr()"
		}
		return &date{
			ValueType:       valueType,
			Constructor:     constructor,
			TimeMethod:      timeMethod,
			TypeDeclaration: typeDeclaration,
			IsOptional:      isOptional,
		}
	}
	if valueType.Primitive == ir.PrimitiveTypeDateTime {
		var (
			typeDeclaration = "*core.DateTime"
			constructor     = "core.NewDateTime"
			timeMethod      = "Time()"
		)
		if isOptional {
			constructor = "core.NewOptionalDateTime"
			timeMethod = "TimePtr()"
		}
		return &date{
			ValueType:       valueType,
			Constructor:     constructor,
			TimeMethod:      timeMethod,
			TypeDeclaration: typeDeclaration,
			IsOptional:      isOptional,
			IsDateTime:      true,
		}
	}
	if valueType.Container != nil && valueType.Container.Optional != nil {
		return maybeDate(valueType.Container.Optional, true)
	}
	return nil
}

// maybeFormatStructTag returns the layout struct tag for [optional] date types.
// Note that we don't need to include a custom layout for DateTime because that
// is the default format used for time.Time types.
func maybeFormatStructTag(valueType *ir.TypeReference) string {
	if valueType.Primitive == ir.PrimitiveTypeDate {
		return `format:"date"`
	}
	if valueType.Type != "container" {
		return ""
	}
	switch valueType.Container.Type {
	case "list":
		return maybeFormatStructTag(valueType.Container.List)
	case "map":
		return maybeFormatStructTag(valueType.Container.Map.ValueType)
	case "optional":
		return maybeFormatStructTag(valueType.Container.Optional)
	case "set":
		return maybeFormatStructTag(valueType.Container.Set)
	}
	return ""
}

// typeNameToFieldName maps the given type name (e.g. *foo.Bar) into its embedded field name
// equivalent (e.g. Bar).
func typeNameToFieldName(typeName string) string {
	if split := strings.Split(typeName, "."); len(split) > 1 {
		return split[len(split)-1]
	}
	return strings.TrimLeft(typeName, "*")
}

// defaultValueForTypeReference returns the default value associated with the given *ir.TypeReference.
// For named types and built-ins, this will just be nil, otherwise it will be the associated primitive
// value.
func defaultValueForTypeReference(typeReference *ir.TypeReference, types map[string]*ir.TypeDeclaration) string {
	if typeReference.Container != nil {
		if typeReference.Container.Literal != nil {
			return ""
		}
		return "nil"
	}
	if typeReference.Named != nil {
		return defaultValueForTypeDeclaration(types[typeReference.Named.TypeId], types)
	}
	if typeReference.Primitive != "" {
		return defaultValueForPrimitiveType(typeReference.Primitive)
	}
	return "nil"
}

func defaultValueForTypeDeclaration(typeDeclaration *ir.TypeDeclaration, types map[string]*ir.TypeDeclaration) string {
	if typeDeclaration.Shape.Alias != nil {
		return defaultValueForTypeReference(typeDeclaration.Shape.Alias.AliasOf, types)
	}
	if typeDeclaration.Shape.Enum != nil {
		return ""
	}
	return "nil"
}

func defaultValueForPrimitiveType(primitiveType ir.PrimitiveType) string {
	switch primitiveType {
	case ir.PrimitiveTypeInteger:
		return "0"
	case ir.PrimitiveTypeDouble:
		return "0"
	case ir.PrimitiveTypeString:
		return `""`
	case ir.PrimitiveTypeBoolean:
		return "false"
	case ir.PrimitiveTypeLong:
		return "0"
	case ir.PrimitiveTypeDateTime:
		return "time.Time{}"
	case ir.PrimitiveTypeDate:
		return "time.Time{}"
	case ir.PrimitiveTypeUuid:
		return "uuid.Nil"
	case ir.PrimitiveTypeBase64:
		return "nil"
	}
	return "nil"
}
