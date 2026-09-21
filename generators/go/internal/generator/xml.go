package generator

import (
	"fmt"
	"strings"

	"github.com/fern-api/fern-go/internal/fern/ir"
	"github.com/fern-api/fern-go/internal/fern/ir/common"
)

const (
	xmlExtraAttributesField = "ExtraAttributes"
	xmlExtraChildrenField   = "ExtraChildren"
	xmlAddChildMethod       = "AddChild"
)

// xmlValueKind describes how a single (non-list) XML value maps to Go.
type xmlValueKind int

const (
	xmlValueString xmlValueKind = iota
	xmlValueInt
	xmlValueInt64
	xmlValueFloat64
	xmlValueBool
	xmlValueUuid
	xmlValueDate
	xmlValueDateTime
	xmlValueEnum
	xmlValueObject
	xmlValueUnion
)

// xmlValue is the resolved shape of an xml-encoded property's type.
type xmlValue struct {
	kind xmlValueKind
	// goType is the Go type of a single item, without any pointer (e.g. "Number", "pkg.Color").
	goType string
	// pointer is true if the field holds a pointer to a single value.
	pointer bool
	// list is true if the field holds a slice of values.
	list bool
	// typeId is set for named types.
	typeId common.TypeId
	// xmlName is the element name for object items.
	xmlName string
	// childNames are the element names an item can be parsed from (objects, or union members).
	childNames []string
	// members are the xml-encoded members of a union item.
	members []*xmlUnionMember
}

type xmlUnionMember struct {
	field   string
	goType  string
	xmlName string
}

// xmlProperty is a property of an xml-encoded object and how it is serialized.
type xmlProperty struct {
	field     string
	xmlName   string
	kind      ir.XmlPropertyKind
	wrapped   bool
	separator string
	value     *xmlValue
}

// xmlResolver resolves type references for xml-encoded properties.
type xmlResolver struct {
	types          map[common.TypeId]*ir.TypeDeclaration
	baseImportPath string
	importPath     string
	visitor        *typeVisitor
}

func (t *typeVisitor) newXmlResolver() *xmlResolver {
	return &xmlResolver{
		types:          t.writer.types,
		baseImportPath: t.baseImportPath,
		importPath:     t.importPath,
		visitor:        t,
	}
}

func (r *xmlResolver) goType(typeReference *ir.TypeReference) string {
	return typeReferenceToGoType(typeReference, r.types, r.visitor.writer.scope, r.baseImportPath, r.importPath, false)
}

// resolve resolves the given type reference into an xmlValue, following aliases and
// unwrapping optional/nullable and list/set containers.
func (r *xmlResolver) resolve(typeReference *ir.TypeReference) (*xmlValue, error) {
	fieldType := r.goType(typeReference)
	value := &xmlValue{
		pointer: strings.HasPrefix(fieldType, "*"),
		list:    strings.HasPrefix(fieldType, "[]"),
	}
	itemType := strings.TrimPrefix(strings.TrimPrefix(fieldType, "[]"), "*")
	if strings.HasPrefix(itemType, "[]") {
		return nil, fmt.Errorf("xml-encoded properties do not support nested lists (%s)", fieldType)
	}
	value.goType = itemType
	if err := r.resolveItem(typeReference, value, make(map[common.TypeId]struct{})); err != nil {
		return nil, err
	}
	return value, nil
}

func (r *xmlResolver) resolveItem(typeReference *ir.TypeReference, value *xmlValue, seen map[common.TypeId]struct{}) error {
	switch {
	case typeReference.Container != nil:
		container := typeReference.Container
		switch {
		case container.Optional != nil:
			return r.resolveItem(container.Optional, value, seen)
		case container.Nullable != nil:
			return r.resolveItem(container.Nullable, value, seen)
		case container.List != nil:
			return r.resolveItem(container.List, value, seen)
		case container.Set != nil:
			return r.resolveItem(container.Set, value, seen)
		}
		return fmt.Errorf("xml-encoded properties do not support %s types", value.goType)
	case typeReference.Primitive != nil:
		switch typeReference.Primitive.V1 {
		case common.PrimitiveTypeV1String, common.PrimitiveTypeV1BigInteger:
			value.kind = xmlValueString
		case common.PrimitiveTypeV1Integer, common.PrimitiveTypeV1Uint:
			value.kind = xmlValueInt
		case common.PrimitiveTypeV1Long, common.PrimitiveTypeV1Uint64:
			value.kind = xmlValueInt64
		case common.PrimitiveTypeV1Float, common.PrimitiveTypeV1Double:
			value.kind = xmlValueFloat64
		case common.PrimitiveTypeV1Boolean:
			value.kind = xmlValueBool
		case common.PrimitiveTypeV1Uuid:
			value.kind = xmlValueUuid
		case common.PrimitiveTypeV1Date:
			value.kind = xmlValueDate
		case common.PrimitiveTypeV1DateTime:
			value.kind = xmlValueDateTime
		default:
			return fmt.Errorf("xml-encoded properties do not support %s values", typeReference.Primitive.V1)
		}
		return nil
	case typeReference.Named != nil:
		typeId := typeReference.Named.TypeId
		if _, ok := seen[typeId]; ok {
			return fmt.Errorf("cyclic alias %s", typeId)
		}
		seen[typeId] = struct{}{}
		declaration, ok := r.types[typeId]
		if !ok {
			return fmt.Errorf("unknown type %s", typeId)
		}
		switch declaration.Shape.Type {
		case "alias":
			// Aliases are transparent in the generated Go code (type X = Y).
			return r.resolveItem(declaration.Shape.Alias.AliasOf, value, seen)
		case "enum":
			value.kind = xmlValueEnum
			value.typeId = typeId
			return nil
		case "object":
			xml := declaration.Encoding.GetXml()
			if xml == nil {
				return fmt.Errorf("%s is used as an xml child element but is not xml-encoded", typeId)
			}
			value.kind = xmlValueObject
			value.typeId = typeId
			value.xmlName = xml.Name
			value.childNames = []string{xml.Name}
			return nil
		case "undiscriminatedUnion":
			value.kind = xmlValueUnion
			value.typeId = typeId
			members, err := r.unionMembers(declaration)
			if err != nil {
				return err
			}
			if len(members) == 0 {
				return fmt.Errorf("%s has no xml-encoded members", typeId)
			}
			value.members = members
			for _, member := range members {
				value.childNames = append(value.childNames, member.xmlName)
			}
			return nil
		}
		return fmt.Errorf("xml-encoded properties do not support %s types (%s)", declaration.Shape.Type, typeId)
	}
	return fmt.Errorf("xml-encoded properties do not support unknown values")
}

// unionMembers returns the xml-encoded object members of an undiscriminated union.
func (r *xmlResolver) unionMembers(declaration *ir.TypeDeclaration) ([]*xmlUnionMember, error) {
	var members []*xmlUnionMember
	// Field names are derived with a single child scope, exactly like VisitUndiscriminatedUnion,
	// so they match the generated struct fields even when members are deduplicated.
	scope := r.visitor.writer.scope.Child()
	for _, member := range declaration.Shape.UndiscriminatedUnion.Members {
		field := typeReferenceToUndiscriminatedUnionField(member.Type, r.types, scope)
		if member.Type.Named == nil {
			continue
		}
		memberDeclaration, ok := r.types[member.Type.Named.TypeId]
		if !ok || memberDeclaration.Shape.Object == nil {
			continue
		}
		xml := memberDeclaration.Encoding.GetXml()
		if xml == nil {
			continue
		}
		members = append(members, &xmlUnionMember{
			field:   field,
			goType:  strings.TrimPrefix(r.goType(member.Type), "*"),
			xmlName: xml.Name,
		})
	}
	return members, nil
}

// xmlProperties collects the xml-encoded properties of the object, including extended ones.
func (r *xmlResolver) xmlProperties(object *ir.ObjectTypeDeclaration) ([]*xmlProperty, error) {
	var properties []*xmlProperty
	for _, extend := range object.Extends {
		extended := resolveObjectTypeDeclaration(extend.TypeId, r.types)
		if extended == nil {
			continue
		}
		extendedProperties, err := r.xmlProperties(extended)
		if err != nil {
			return nil, err
		}
		properties = append(properties, extendedProperties...)
	}
	for _, property := range object.Properties {
		if isLiteralType(property.ValueType, r.types) {
			continue
		}
		value, err := r.resolve(property.ValueType)
		if err != nil {
			return nil, fmt.Errorf("property %s: %w", property.Name.WireValue, err)
		}
		xmlProperty := &xmlProperty{
			field:   goExportedFieldName(property.Name.Name.PascalCase.UnsafeName),
			xmlName: property.Name.WireValue,
			kind:    ir.XmlPropertyKindElement,
			value:   value,
		}
		if xml := property.Xml; xml != nil {
			xmlProperty.kind = xml.Kind
			if xml.Name != nil {
				xmlProperty.xmlName = *xml.Name
			}
			xmlProperty.wrapped = xml.Wrapped != nil && *xml.Wrapped
			if xml.ListSeparator != nil {
				xmlProperty.separator = *xml.ListSeparator
			}
		}
		if xmlProperty.separator == "" && value.list && xmlProperty.kind != ir.XmlPropertyKindElement {
			xmlProperty.separator = " "
		}
		properties = append(properties, xmlProperty)
	}
	return properties, nil
}

// xmlFromElementFunc returns the name of the FromXmlElement function for the given Go type,
// preserving any package qualifier (e.g. "pkg.Number" -> "pkg.NumberFromXmlElement").
func xmlFromElementFunc(goType string) string {
	return goType + "FromXmlElement"
}

// xmlEnumFromStringFunc returns the name of the enum's FromString constructor.
func xmlEnumFromStringFunc(goType string) string {
	if index := strings.LastIndex(goType, "."); index >= 0 {
		return goType[:index+1] + "New" + goType[index+1:] + "FromString"
	}
	return "New" + goType + "FromString"
}

// xmlFormatExpression returns a Go expression formatting the (non-pointer) value as an XML string.
func xmlFormatExpression(value *xmlValue, expression string) string {
	switch value.kind {
	case xmlValueString:
		return expression
	case xmlValueInt:
		return "core.FormatXmlInt(" + expression + ")"
	case xmlValueInt64:
		return "core.FormatXmlInt64(" + expression + ")"
	case xmlValueFloat64:
		return "core.FormatXmlFloat64(" + expression + ")"
	case xmlValueBool:
		return "core.FormatXmlBool(" + expression + ")"
	case xmlValueUuid:
		return expression + ".String()"
	case xmlValueDate:
		return expression + `.Format("2006-01-02")`
	case xmlValueDateTime:
		return expression + ".Format(time.RFC3339)"
	case xmlValueEnum:
		return "string(" + expression + ")"
	}
	return expression
}

// writeXmlParseValue writes statements parsing the XML string held in 'input' into a new
// variable named 'output', returning an error decorated with the property name on failure.
func (t *typeVisitor) writeXmlParseValue(value *xmlValue, input string, output string, propertyName string) {
	fail := fmt.Sprintf(`return nil, fmt.Errorf("%s.%s: %%w", err)`, t.typeName, propertyName)
	switch value.kind {
	case xmlValueString:
		t.writer.P(output, " := ", input)
	case xmlValueInt:
		t.writer.P(output, ", err := core.ParseXmlInt(", input, ")")
		t.writer.P("if err != nil {")
		t.writer.P(fail)
		t.writer.P("}")
	case xmlValueInt64:
		t.writer.P(output, ", err := core.ParseXmlInt64(", input, ")")
		t.writer.P("if err != nil {")
		t.writer.P(fail)
		t.writer.P("}")
	case xmlValueFloat64:
		t.writer.P(output, ", err := core.ParseXmlFloat64(", input, ")")
		t.writer.P("if err != nil {")
		t.writer.P(fail)
		t.writer.P("}")
	case xmlValueBool:
		t.writer.P(output, ", err := core.ParseXmlBool(", input, ")")
		t.writer.P("if err != nil {")
		t.writer.P(fail)
		t.writer.P("}")
	case xmlValueUuid:
		t.writer.P(output, ", err := uuid.Parse(", input, ")")
		t.writer.P("if err != nil {")
		t.writer.P(fail)
		t.writer.P("}")
	case xmlValueDate:
		t.writer.P(output, `, err := time.Parse("2006-01-02", `, input, ")")
		t.writer.P("if err != nil {")
		t.writer.P(fail)
		t.writer.P("}")
	case xmlValueDateTime:
		t.writer.P(output, ", err := time.Parse(time.RFC3339, ", input, ")")
		t.writer.P("if err != nil {")
		t.writer.P(fail)
		t.writer.P("}")
	case xmlValueEnum:
		t.writer.P(output, ", err := ", xmlEnumFromStringFunc(value.goType), "(", input, ")")
		t.writer.P("if err != nil {")
		t.writer.P(fail)
		t.writer.P("}")
	}
}

// writeXmlObjectMethods writes the XML serialization, parsing and builder methods for an
// xml-encoded object type.
func (t *typeVisitor) writeXmlObjectMethods(object *ir.ObjectTypeDeclaration, xml *ir.XmlEncoding, fieldNames map[string]struct{}) error {
	resolver := t.newXmlResolver()
	properties, err := resolver.xmlProperties(object)
	if err != nil {
		return fmt.Errorf("%s: %w", t.typeName, err)
	}
	receiver := typeNameToReceiver(t.typeName)

	// ToXmlElement
	t.writer.P("// ToXmlElement returns the generic XML representation of the ", t.typeName, ".")
	t.writer.P("func (", receiver, " *", t.typeName, ") ToXmlElement() *core.XmlElement {")
	t.writer.P("element := &core.XmlElement{")
	t.writer.P("Name: ", quote(xml.Name), ",")
	if xml.Namespace != nil {
		t.writer.P("Namespace: ", quote(*xml.Namespace), ",")
	}
	if xml.Prefix != nil {
		t.writer.P("Prefix: ", quote(*xml.Prefix), ",")
	}
	t.writer.P("}")
	t.writer.P("if ", receiver, " == nil {")
	t.writer.P("return element")
	t.writer.P("}")
	for _, property := range properties {
		if property.kind != ir.XmlPropertyKindAttribute {
			continue
		}
		t.writeXmlSerializeScalar(receiver, property, "element.SetAttribute("+quote(property.xmlName)+", %s)")
	}
	t.writer.P("if len(", receiver, ".", xmlExtraAttributesField, ") > 0 {")
	t.writer.P("names := make([]string, 0, len(", receiver, ".", xmlExtraAttributesField, "))")
	t.writer.P("for name := range ", receiver, ".", xmlExtraAttributesField, " {")
	t.writer.P("names = append(names, name)")
	t.writer.P("}")
	t.writer.P("sort.Strings(names)")
	t.writer.P("for _, name := range names {")
	t.writer.P("element.SetAttribute(name, ", receiver, ".", xmlExtraAttributesField, "[name])")
	t.writer.P("}")
	t.writer.P("}")
	for _, property := range properties {
		if property.kind != ir.XmlPropertyKindText {
			continue
		}
		t.writeXmlSerializeScalar(receiver, property, "element.Text = %s")
	}
	extraChildren := receiver + "." + xmlExtraChildrenField
	if hasWrappedList(properties) {
		// Unknown content parsed out of a wrapper is merged back into the wrapper
		// emitted for the typed items, so a document round-trips to one wrapper.
		t.writer.P("extraChildren := ", extraChildren)
		extraChildren = "extraChildren"
	}
	for _, property := range properties {
		if property.kind != ir.XmlPropertyKindElement {
			continue
		}
		t.writeXmlSerializeElement(receiver, property)
	}
	t.writer.P("for _, child := range ", extraChildren, " {")
	t.writer.P("element.AddChild(child)")
	t.writer.P("}")
	t.writer.P("return element")
	t.writer.P("}")
	t.writer.P()

	// ToXml
	t.writer.P("// ToXml serializes the ", t.typeName, " to an XML string.")
	t.writer.P("func (", receiver, " *", t.typeName, ") ToXml() string {")
	t.writer.P("return ", receiver, ".ToXmlElement().ToXml()")
	t.writer.P("}")
	t.writer.P()

	// AddChild
	addChild := xmlAddChildMethod
	if _, ok := fieldNames[addChild]; ok {
		addChild = "AddXmlChild"
	}
	t.writer.P("// ", addChild, " appends an arbitrary child element (e.g. a core.XmlElement) and returns the ", t.typeName, ".")
	t.writer.P("func (", receiver, " *", t.typeName, ") ", addChild, "(child core.XmlNode) *", t.typeName, " {")
	t.writer.P(receiver, ".", xmlExtraChildrenField, " = append(", receiver, ".", xmlExtraChildrenField, ", child)")
	t.writer.P("return ", receiver)
	t.writer.P("}")
	t.writer.P()

	// Builders
	t.writeXmlBuilders(receiver, properties, fieldNames, addChild)

	// FromXml
	t.writer.P("// ", t.typeName, "FromXml parses a ", t.typeName, " from an XML document.")
	t.writer.P("func ", t.typeName, "FromXml(document string) (*", t.typeName, ", error) {")
	t.writer.P("element, err := core.ParseXml(document)")
	t.writer.P("if err != nil {")
	t.writer.P("return nil, err")
	t.writer.P("}")
	t.writer.P("return ", t.typeName, "FromXmlElement(element)")
	t.writer.P("}")
	t.writer.P()

	// FromXmlElement
	t.writer.P("// ", t.typeName, "FromXmlElement parses a ", t.typeName, " from its generic XML representation.")
	t.writer.P("func ", t.typeName, "FromXmlElement(element *core.XmlElement) (*", t.typeName, ", error) {")
	rootCheck := "element == nil || element.Name != " + quote(xml.Name)
	if xml.Namespace != nil {
		rootCheck += " || (element.Namespace != \"\" && element.Namespace != " + quote(*xml.Namespace) + ")"
	}
	t.writer.P("if ", rootCheck, " {")
	t.writer.P("return nil, core.XmlRootError(", quote(xml.Name), ", element)")
	t.writer.P("}")
	t.writer.P("result := &", t.typeName, "{}")
	t.writer.P("for _, attribute := range element.Attributes {")
	t.writer.P("switch attribute.Name {")
	for _, property := range properties {
		if property.kind != ir.XmlPropertyKindAttribute {
			continue
		}
		t.writer.P("case ", quote(property.xmlName), ":")
		t.writeXmlParseScalar(property, "attribute.Value")
	}
	t.writer.P("default:")
	t.writer.P("if result.", xmlExtraAttributesField, " == nil {")
	t.writer.P("result.", xmlExtraAttributesField, " = make(map[string]string)")
	t.writer.P("}")
	t.writer.P("result.", xmlExtraAttributesField, "[attribute.Name] = attribute.Value")
	t.writer.P("}")
	t.writer.P("}")
	for _, property := range properties {
		if property.kind != ir.XmlPropertyKindText {
			continue
		}
		// Whitespace-only text is indentation between child elements, not a value.
		t.writer.P("if strings.TrimSpace(element.Text) != \"\" {")
		input := "element.Text"
		if property.value.kind != xmlValueString || property.value.list {
			input = "strings.TrimSpace(element.Text)"
		}
		t.writeXmlParseScalar(property, input)
		t.writer.P("}")
	}
	t.writer.P("for _, child := range element.ChildElements() {")
	t.writer.P("switch child.Name {")
	for _, property := range properties {
		if property.kind != ir.XmlPropertyKindElement {
			continue
		}
		t.writeXmlParseElement(property)
	}
	t.writer.P("default:")
	t.writer.P("result.", xmlExtraChildrenField, " = append(result.", xmlExtraChildrenField, ", child)")
	t.writer.P("}")
	t.writer.P("}")
	t.writer.P("return result, nil")
	t.writer.P("}")
	t.writer.P()
	return nil
}

// writeXmlSerializeScalar writes the serialization of an attribute or text property. The
// format receives the formatted string expression.
func (t *typeVisitor) writeXmlSerializeScalar(receiver string, property *xmlProperty, format string) {
	field := receiver + "." + property.field
	value := property.value
	if value.list {
		t.writer.P("if len(", field, ") > 0 {")
		t.writer.P("items := make([]string, 0, len(", field, "))")
		t.writer.P("for _, item := range ", field, " {")
		t.writer.P("items = append(items, ", xmlFormatExpression(value, "item"), ")")
		t.writer.P("}")
		t.writer.P(fmt.Sprintf(format, "strings.Join(items, "+quote(property.separator)+")"))
		t.writer.P("}")
		return
	}
	if value.pointer {
		t.writer.P("if ", field, " != nil {")
		t.writer.P(fmt.Sprintf(format, xmlFormatExpression(value, "*"+field)))
		t.writer.P("}")
		return
	}
	if value.kind == xmlValueString || value.kind == xmlValueEnum {
		t.writer.P("if ", field, ` != "" {`)
		t.writer.P(fmt.Sprintf(format, xmlFormatExpression(value, field)))
		t.writer.P("}")
		return
	}
	t.writer.P(fmt.Sprintf(format, xmlFormatExpression(value, field)))
}

// writeXmlSerializeElement writes the serialization of a child element property.
func (t *typeVisitor) writeXmlSerializeElement(receiver string, property *xmlProperty) {
	field := receiver + "." + property.field
	value := property.value
	isNode := value.kind == xmlValueObject || value.kind == xmlValueUnion
	if value.list && property.wrapped {
		t.writer.P("{")
		t.writer.P("wrapper := core.NewXmlElement(", quote(property.xmlName), ")")
		t.writer.P("for _, item := range ", field, " {")
		if isNode {
			t.writer.P("if item != nil {")
			t.writer.P("wrapper.AddChild(item)")
			t.writer.P("}")
		} else {
			t.writer.P("wrapper.AddChild(core.NewXmlElement(", quote(property.xmlName), ").SetText(", xmlFormatExpression(value, "item"), "))")
		}
		t.writer.P("}")
		t.writer.P("var unknown *core.XmlElement")
		t.writer.P("unknown, extraChildren = core.TakeXmlElement(extraChildren, ", quote(property.xmlName), ")")
		t.writer.P("wrapper.Merge(unknown)")
		t.writer.P("if len(wrapper.Children) > 0 || len(wrapper.Attributes) > 0 || wrapper.Text != \"\" {")
		t.writer.P("element.AddChild(wrapper)")
		t.writer.P("}")
		t.writer.P("}")
		return
	}
	if value.list {
		t.writer.P("if len(", field, ") > 0 {")
		t.writer.P("for _, item := range ", field, " {")
		if isNode {
			t.writer.P("if item != nil {")
			t.writer.P("element.AddChild(item)")
			t.writer.P("}")
		} else {
			t.writer.P("element.AddChild(core.NewXmlElement(", quote(property.xmlName), ").SetText(", xmlFormatExpression(value, "item"), "))")
		}
		t.writer.P("}")
		t.writer.P("}")
		return
	}
	if isNode {
		t.writer.P("if ", field, " != nil {")
		t.writer.P("element.AddChild(", field, ")")
		t.writer.P("}")
		return
	}
	if value.pointer {
		t.writer.P("if ", field, " != nil {")
		t.writer.P("element.AddChild(core.NewXmlElement(", quote(property.xmlName), ").SetText(", xmlFormatExpression(value, "*"+field), "))")
		t.writer.P("}")
		return
	}
	t.writer.P("element.AddChild(core.NewXmlElement(", quote(property.xmlName), ").SetText(", xmlFormatExpression(value, field), "))")
}

// hasWrappedList reports whether any child element property is a wrapped list.
func hasWrappedList(properties []*xmlProperty) bool {
	for _, property := range properties {
		if property.kind == ir.XmlPropertyKindElement && property.wrapped && property.value.list {
			return true
		}
	}
	return false
}

// writeXmlParseScalar writes the statements assigning the XML string in 'input' to the property.
func (t *typeVisitor) writeXmlParseScalar(property *xmlProperty, input string) {
	value := property.value
	if value.list {
		t.writer.P("for _, item := range core.SplitXmlList(", input, ", ", quote(property.separator), ") {")
		t.writeXmlParseValue(value, "item", "value", property.xmlName)
		t.writer.P("result.", property.field, " = append(result.", property.field, ", value)")
		t.writer.P("}")
		return
	}
	t.writeXmlParseValue(value, input, "value", property.xmlName)
	if value.pointer {
		t.writer.P("result.", property.field, " = &value")
		return
	}
	t.writer.P("result.", property.field, " = value")
}

// writeXmlParseElement writes the switch cases parsing a child element property.
func (t *typeVisitor) writeXmlParseElement(property *xmlProperty) {
	value := property.value
	if property.wrapped && value.list {
		t.writer.P("case ", quote(property.xmlName), ":")
		t.writer.P("unknown := &core.XmlElement{Name: child.Name, Namespace: child.Namespace, Prefix: child.Prefix, Attributes: child.Attributes, Text: strings.TrimSpace(child.Text)}")
		t.writer.P("for _, item := range child.ChildElements() {")
		t.writer.P("switch item.Name {")
		t.writeXmlParseChildCases(property, "item")
		t.writer.P("default:")
		t.writer.P("unknown.AddChild(item)")
		t.writer.P("}")
		t.writer.P("}")
		t.writer.P("if len(unknown.Children) > 0 || len(unknown.Attributes) > 0 || unknown.Text != \"\" {")
		t.writer.P("result.", xmlExtraChildrenField, " = append(result.", xmlExtraChildrenField, ", unknown)")
		t.writer.P("}")
		return
	}
	t.writeXmlParseChildCases(property, "child")
}

// writeXmlParseChildCases writes the switch cases matching the element named 'element' to the property.
func (t *typeVisitor) writeXmlParseChildCases(property *xmlProperty, element string) {
	value := property.value
	assign := func(expression string) {
		if value.list {
			t.writer.P("result.", property.field, " = append(result.", property.field, ", ", expression, ")")
			return
		}
		t.writer.P("result.", property.field, " = ", expression)
	}
	switch value.kind {
	case xmlValueObject, xmlValueUnion:
		t.writer.P("case ", strings.Join(quoteAll(value.childNames), ", "), ":")
		t.writer.P("value, err := ", xmlFromElementFunc(value.goType), "(", element, ")")
		t.writer.P("if err != nil {")
		t.writer.P("return nil, err")
		t.writer.P("}")
		assign("value")
	default:
		t.writer.P("case ", quote(property.xmlName), ":")
		t.writeXmlParseValue(value, element+".Text", "value", property.xmlName)
		if value.pointer && !value.list {
			assign("&value")
		} else {
			assign("value")
		}
	}
}

// writeXmlBuilders writes fluent methods appending typed children to list properties,
// e.g. func (r *Response) Say(say *Say) *Response.
func (t *typeVisitor) writeXmlBuilders(receiver string, properties []*xmlProperty, fieldNames map[string]struct{}, addChild string) {
	used := map[string]struct{}{
		"ToXmlElement": {}, "ToXml": {}, "String": {}, "MarshalJSON": {}, "UnmarshalJSON": {},
		"GetExtraProperties": {}, addChild: {},
	}
	for name := range fieldNames {
		used[name] = struct{}{}
		used["Get"+name] = struct{}{}
		used["Set"+name] = struct{}{}
	}
	for _, property := range properties {
		value := property.value
		if property.kind != ir.XmlPropertyKindElement || !value.list {
			continue
		}
		switch value.kind {
		case xmlValueObject:
			name := xmlBuilderName(value.goType, used)
			t.writer.P("// ", name, " appends a child element and returns the ", t.typeName, ".")
			t.writer.P("func (", receiver, " *", t.typeName, ") ", name, "(child *", value.goType, ") *", t.typeName, " {")
			t.writer.P(receiver, ".", property.field, " = append(", receiver, ".", property.field, ", child)")
			t.writer.P("return ", receiver)
			t.writer.P("}")
			t.writer.P()
		case xmlValueUnion:
			for _, member := range value.members {
				name := xmlBuilderName(member.goType, used)
				t.writer.P("// ", name, " appends a child element and returns the ", t.typeName, ".")
				t.writer.P("func (", receiver, " *", t.typeName, ") ", name, "(child *", member.goType, ") *", t.typeName, " {")
				t.writer.P(receiver, ".", property.field, " = append(", receiver, ".", property.field, ", ", xmlUnionConstructor(value.goType, member, "child"), ")")
				t.writer.P("return ", receiver)
				t.writer.P("}")
				t.writer.P()
			}
		}
	}
}

// xmlBuilderName returns the builder method name for the child type, prefixing it with
// "Add" if the plain name collides with a field or another method.
func xmlBuilderName(goType string, used map[string]struct{}) string {
	name := goType
	if index := strings.LastIndex(name, "."); index >= 0 {
		name = name[index+1:]
	}
	if _, ok := used[name]; ok {
		name = "Add" + name
	}
	for {
		if _, ok := used[name]; !ok {
			break
		}
		name = "Add" + name
	}
	used[name] = struct{}{}
	return name
}

// xmlUnionConstructor returns an expression constructing the union from the given member value.
func xmlUnionConstructor(unionGoType string, member *xmlUnionMember, expression string) string {
	if index := strings.LastIndex(unionGoType, "."); index >= 0 {
		return unionGoType[:index+1] + "New" + unionGoType[index+1:] + "From" + member.field + "(" + expression + ")"
	}
	return "&" + unionGoType + "{typ: " + quote(member.field) + ", " + member.field + ": " + expression + "}"
}

// writeXmlUnionMethods writes the XML methods for an undiscriminated union whose members
// are xml-encoded objects, so that it can be used as a child element.
func (t *typeVisitor) writeXmlUnionMethods(union *ir.UndiscriminatedUnionTypeDeclaration) error {
	resolver := t.newXmlResolver()
	members, err := resolver.unionMembers(t.writer.types[t.typeId])
	if err != nil {
		return err
	}
	if len(members) == 0 {
		return nil
	}
	receiver := typeNameToReceiver(t.typeName)
	t.writer.P("// ToXmlElement returns the generic XML representation of the selected member.")
	t.writer.P("func (", receiver, " *", t.typeName, ") ToXmlElement() *core.XmlElement {")
	t.writer.P("if ", receiver, " == nil {")
	t.writer.P("return nil")
	t.writer.P("}")
	t.writer.P("switch {")
	for _, member := range members {
		t.writer.P("case ", receiver, ".typ == ", quote(member.field), " || ", receiver, ".", member.field, " != nil:")
		t.writer.P("return ", receiver, ".", member.field, ".ToXmlElement()")
	}
	t.writer.P("}")
	t.writer.P("return nil")
	t.writer.P("}")
	t.writer.P()

	t.writer.P("// ", t.typeName, "FromXmlElement parses the member matching the element's name.")
	t.writer.P("func ", t.typeName, "FromXmlElement(element *core.XmlElement) (*", t.typeName, ", error) {")
	t.writer.P("if element == nil {")
	t.writer.P(`return nil, fmt.Errorf("expected an element for %T, got nil", (*`, t.typeName, ")(nil))")
	t.writer.P("}")
	t.writer.P("switch element.Name {")
	for _, member := range members {
		t.writer.P("case ", quote(member.xmlName), ":")
		t.writer.P("value, err := ", xmlFromElementFunc(member.goType), "(element)")
		t.writer.P("if err != nil {")
		t.writer.P("return nil, err")
		t.writer.P("}")
		t.writer.P("return &", t.typeName, "{typ: ", quote(member.field), ", ", member.field, ": value}, nil")
	}
	t.writer.P("}")
	t.writer.P(`return nil, fmt.Errorf("unexpected element <%s> for %T", element.QualifiedName(), (*`, t.typeName, ")(nil))")
	t.writer.P("}")
	t.writer.P()
	return nil
}

func quote(s string) string {
	return fmt.Sprintf("%q", s)
}

func quoteAll(values []string) []string {
	quoted := make([]string, 0, len(values))
	for _, value := range values {
		quoted = append(quoted, quote(value))
	}
	return quoted
}
