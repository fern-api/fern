package core

import (
	"bytes"
	"encoding/xml"
	"errors"
	"fmt"
	"io"
	"strconv"
	"strings"
)

// XmlHeader is the declaration emitted by ToXmlDocument.
const XmlHeader = `<?xml version="1.0" encoding="UTF-8"?>`

// XmlNode is implemented by every value that can be rendered as an XML element,
// including the generated xml-encoded types and XmlElement.
type XmlNode interface {
	ToXmlElement() *XmlElement
}

// XmlAttribute is a single attribute of an XmlElement, in declaration order.
type XmlAttribute struct {
	Name  string
	Value string
}

// XmlElement is a generic XML element. It carries the children the generated
// types don't know about, and is the escape hatch for emitting arbitrary tags.
type XmlElement struct {
	Name       string
	Namespace  string
	Prefix     string
	Text       string
	Attributes []XmlAttribute
	Children   []XmlNode
}

// NewXmlElement returns an XmlElement with the given tag name.
func NewXmlElement(name string) *XmlElement {
	return &XmlElement{Name: name}
}

// ToXmlElement implements XmlNode.
func (x *XmlElement) ToXmlElement() *XmlElement {
	return x
}

// SetText replaces the element's text content and returns the element.
func (x *XmlElement) SetText(text string) *XmlElement {
	x.Text = text
	return x
}

// SetAttribute sets (or replaces) an attribute and returns the element.
func (x *XmlElement) SetAttribute(name string, value string) *XmlElement {
	for i := range x.Attributes {
		if x.Attributes[i].Name == name {
			x.Attributes[i].Value = value
			return x
		}
	}
	x.Attributes = append(x.Attributes, XmlAttribute{Name: name, Value: value})
	return x
}

// GetAttribute returns the value of the named attribute, and whether it is set.
func (x *XmlElement) GetAttribute(name string) (string, bool) {
	for _, attribute := range x.Attributes {
		if attribute.Name == name {
			return attribute.Value, true
		}
	}
	return "", false
}

// AddChild appends a child node and returns the element.
func (x *XmlElement) AddChild(child XmlNode) *XmlElement {
	x.Children = append(x.Children, child)
	return x
}

// ChildElements returns the children as XmlElements.
func (x *XmlElement) ChildElements() []*XmlElement {
	elements := make([]*XmlElement, 0, len(x.Children))
	for _, child := range x.Children {
		if child == nil {
			continue
		}
		if element := child.ToXmlElement(); element != nil {
			elements = append(elements, element)
		}
	}
	return elements
}

// QualifiedName returns the prefixed tag name (e.g. "tw:Dial").
func (x *XmlElement) QualifiedName() string {
	if x.Prefix != "" {
		return x.Prefix + ":" + x.Name
	}
	return x.Name
}

// ToXml serializes the element without an XML declaration.
func (x *XmlElement) ToXml() string {
	var buffer bytes.Buffer
	x.write(&buffer, make(map[string]string))
	return buffer.String()
}

// String implements fmt.Stringer.
func (x *XmlElement) String() string {
	return x.ToXml()
}

// ToXmlDocument serializes the element as a document with an XML declaration.
func (x *XmlElement) ToXmlDocument() string {
	return XmlHeader + x.ToXml()
}

func (x *XmlElement) write(buffer *bytes.Buffer, declared map[string]string) {
	name := x.QualifiedName()
	buffer.WriteByte('<')
	buffer.WriteString(name)
	if declared[x.Prefix] != x.Namespace && (x.Namespace != "" || x.Prefix == "") {
		declared = copyDeclarations(declared)
		declared[x.Prefix] = x.Namespace
		if x.Prefix == "" {
			buffer.WriteString(` xmlns="`)
		} else {
			buffer.WriteString(` xmlns:` + x.Prefix + `="`)
		}
		xmlEscape(buffer, x.Namespace)
		buffer.WriteByte('"')
	}
	for _, attribute := range x.Attributes {
		buffer.WriteByte(' ')
		xmlEscape(buffer, attribute.Name)
		buffer.WriteString(`="`)
		xmlEscape(buffer, attribute.Value)
		buffer.WriteByte('"')
	}
	children := x.ChildElements()
	if x.Text == "" && len(children) == 0 {
		buffer.WriteString(" />")
		return
	}
	buffer.WriteByte('>')
	xmlEscape(buffer, x.Text)
	for _, child := range children {
		child.write(buffer, declared)
	}
	buffer.WriteString("</")
	buffer.WriteString(name)
	buffer.WriteByte('>')
}

func copyDeclarations(declared map[string]string) map[string]string {
	result := make(map[string]string, len(declared)+1)
	for prefix, namespace := range declared {
		result[prefix] = namespace
	}
	return result
}

func xmlEscape(buffer *bytes.Buffer, value string) {
	// EscapeText only fails on writer errors, which bytes.Buffer never returns.
	_ = xml.EscapeText(buffer, []byte(value))
}

// ParseXml parses an XML document into an XmlElement tree. Processing
// instructions and comments are ignored; DOCTYPE declarations are rejected.
func ParseXml(document string) (*XmlElement, error) {
	decoder := xml.NewDecoder(strings.NewReader(document))
	decoder.Strict = true
	decoder.Entity = xml.HTMLEntity
	var (
		root   *XmlElement
		stack  []*XmlElement
		scopes = [][]xmlDeclaration{{{prefix: "xml", namespace: xmlNamespace}}}
	)
	for {
		token, err := decoder.Token()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("invalid xml: %w", err)
		}
		switch token := token.(type) {
		case xml.Directive:
			return nil, errors.New("invalid xml: DOCTYPE declarations are not allowed")
		case xml.StartElement:
			element, declared := xmlElementFromStart(token, scopes[len(scopes)-1])
			scopes = append(scopes, declared)
			if len(stack) == 0 {
				if root != nil {
					return nil, errors.New("invalid xml: multiple root elements")
				}
				root = element
			} else {
				parent := stack[len(stack)-1]
				parent.Children = append(parent.Children, element)
			}
			stack = append(stack, element)
		case xml.EndElement:
			if len(stack) == 0 {
				return nil, errors.New("invalid xml: unexpected end element")
			}
			stack = stack[:len(stack)-1]
			scopes = scopes[:len(scopes)-1]
		case xml.CharData:
			if len(stack) > 0 {
				stack[len(stack)-1].Text += string(token)
			}
		}
	}
	if root == nil {
		return nil, errors.New("invalid xml: no root element")
	}
	return root, nil
}

const xmlNamespace = "http://www.w3.org/XML/1998/namespace"

// xmlDeclaration is a single xmlns declaration (prefix "" is the default namespace).
type xmlDeclaration struct {
	prefix    string
	namespace string
}

// prefixFor returns the prefix most recently bound to the namespace in scope.
func prefixFor(scope []xmlDeclaration, namespace string) (string, bool) {
	for i := len(scope) - 1; i >= 0; i-- {
		if scope[i].namespace == namespace {
			return scope[i].prefix, true
		}
	}
	return "", false
}

// xmlElementFromStart converts a start tag into an XmlElement. The decoder
// resolves prefixes to namespace URIs, so the prefixes are recovered from the
// xmlns declarations in scope (inherited, plus those on this element); the
// innermost declaration of a namespace wins.
func xmlElementFromStart(start xml.StartElement, inherited []xmlDeclaration) (*XmlElement, []xmlDeclaration) {
	element := &XmlElement{
		Name:      start.Name.Local,
		Namespace: start.Name.Space,
	}
	scope := inherited
	copied := false
	for _, attribute := range start.Attr {
		var declaredPrefix string
		switch {
		case attribute.Name.Space == "xmlns":
			declaredPrefix = attribute.Name.Local
		case attribute.Name.Space == "" && attribute.Name.Local == "xmlns":
			declaredPrefix = ""
		default:
			continue
		}
		if !copied {
			scope = append([]xmlDeclaration(nil), inherited...)
			copied = true
		}
		scope = append(scope, xmlDeclaration{prefix: declaredPrefix, namespace: attribute.Value})
	}
	for _, attribute := range start.Attr {
		if attribute.Name.Space == "xmlns" || (attribute.Name.Space == "" && attribute.Name.Local == "xmlns") {
			continue
		}
		name := attribute.Name.Local
		if attribute.Name.Space != "" {
			if prefix, ok := prefixFor(scope, attribute.Name.Space); ok && prefix != "" {
				name = prefix + ":" + name
			} else {
				name = attribute.Name.Space + ":" + name
			}
		}
		element.Attributes = append(element.Attributes, XmlAttribute{Name: name, Value: attribute.Value})
	}
	if element.Namespace != "" {
		element.Prefix, _ = prefixFor(scope, element.Namespace)
	}
	return element, scope
}

// XmlRootError is returned when a parsed document's root element has an unexpected name.
func XmlRootError(expected string, element *XmlElement) error {
	if element == nil {
		return fmt.Errorf("expected root element <%s>, got nil", expected)
	}
	if element.Namespace != "" {
		return fmt.Errorf("expected root element <%s>, got <%s> (namespace %q)", expected, element.QualifiedName(), element.Namespace)
	}
	return fmt.Errorf("expected root element <%s>, got <%s>", expected, element.QualifiedName())
}

// TakeXmlElement removes the first XmlElement named 'name' from nodes and returns
// it together with the remaining nodes. It is used to merge the unknown content of
// a wrapped list back into the wrapper the generated types emit.
func TakeXmlElement(nodes []XmlNode, name string) (*XmlElement, []XmlNode) {
	for i, node := range nodes {
		element, ok := node.(*XmlElement)
		if !ok || element == nil || element.Name != name {
			continue
		}
		remaining := make([]XmlNode, 0, len(nodes)-1)
		remaining = append(remaining, nodes[:i]...)
		return element, append(remaining, nodes[i+1:]...)
	}
	return nil, nodes
}

// Merge copies the attributes, text and children of other onto x and returns x.
func (x *XmlElement) Merge(other *XmlElement) *XmlElement {
	if other == nil {
		return x
	}
	for _, attribute := range other.Attributes {
		x.SetAttribute(attribute.Name, attribute.Value)
	}
	if other.Text != "" {
		x.Text = other.Text
	}
	x.Children = append(x.Children, other.Children...)
	return x
}

// ParseXmlBool parses an XML boolean ("true"/"false"/"1"/"0").
func ParseXmlBool(value string) (bool, error) {
	switch strings.TrimSpace(value) {
	case "true", "1":
		return true, nil
	case "false", "0":
		return false, nil
	}
	return false, fmt.Errorf("invalid xml boolean %q", value)
}

// ParseXmlInt parses an XML integer.
func ParseXmlInt(value string) (int, error) {
	parsed, err := strconv.Atoi(strings.TrimSpace(value))
	if err != nil {
		return 0, fmt.Errorf("invalid xml integer %q", value)
	}
	return parsed, nil
}

// ParseXmlInt64 parses an XML 64-bit integer.
func ParseXmlInt64(value string) (int64, error) {
	parsed, err := strconv.ParseInt(strings.TrimSpace(value), 10, 64)
	if err != nil {
		return 0, fmt.Errorf("invalid xml integer %q", value)
	}
	return parsed, nil
}

// ParseXmlFloat64 parses an XML floating point number.
func ParseXmlFloat64(value string) (float64, error) {
	parsed, err := strconv.ParseFloat(strings.TrimSpace(value), 64)
	if err != nil {
		return 0, fmt.Errorf("invalid xml number %q", value)
	}
	return parsed, nil
}

// FormatXmlBool formats a boolean as an XML value.
func FormatXmlBool(value bool) string {
	return strconv.FormatBool(value)
}

// FormatXmlInt formats an integer as an XML value.
func FormatXmlInt(value int) string {
	return strconv.Itoa(value)
}

// FormatXmlInt64 formats a 64-bit integer as an XML value.
func FormatXmlInt64(value int64) string {
	return strconv.FormatInt(value, 10)
}

// FormatXmlFloat64 formats a floating point number as an XML value.
func FormatXmlFloat64(value float64) string {
	return strconv.FormatFloat(value, 'f', -1, 64)
}

// SplitXmlList splits a separator-delimited attribute or text value into items,
// dropping empty entries.
func SplitXmlList(value string, separator string) []string {
	var items []string
	for _, item := range strings.Split(value, separator) {
		if item != "" {
			items = append(items, item)
		}
	}
	return items
}
