package core

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestXmlElementToXml(t *testing.T) {
	element := NewXmlElement("Say").
		SetAttribute("voice", "man").
		SetText(`a < b & "c"`).
		AddChild(NewXmlElement("break").SetAttribute("time", "1s")).
		AddChild(NewXmlElement("Hangup"))
	assert.Equal(
		t,
		`<Say voice="man">a &lt; b &amp; &#34;c&#34;<break time="1s" /><Hangup /></Say>`,
		element.ToXml(),
	)
	assert.Equal(t, XmlHeader+element.ToXml(), element.ToXmlDocument())
}

func TestXmlElementNamespaces(t *testing.T) {
	element := NewXmlElement("Response").
		AddChild(&XmlElement{Name: "Dial", Namespace: "https://example.com/tw", Prefix: "tw", Text: "+1"})
	assert.Equal(
		t,
		`<Response><tw:Dial xmlns:tw="https://example.com/tw">+1</tw:Dial></Response>`,
		element.ToXml(),
	)
	root := &XmlElement{Name: "Root", Namespace: "urn:x", Prefix: "x"}
	root.AddChild(&XmlElement{Name: "Child", Namespace: "urn:x", Prefix: "x"})
	assert.Equal(t, `<x:Root xmlns:x="urn:x"><x:Child /></x:Root>`, root.ToXml())
}

func TestParseXmlRoundTrip(t *testing.T) {
	document := `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="man" xml:lang="en">hi<break time="1s" /></Say><tw:Dial xmlns:tw="urn:tw" tw:record="true">+1</tw:Dial><Unknown k="v"><Nested /></Unknown></Response>`
	root, err := ParseXml(document)
	require.NoError(t, err)
	assert.Equal(t, "Response", root.Name)
	children := root.ChildElements()
	require.Len(t, children, 3)

	say := children[0]
	assert.Equal(t, "hi", say.Text)
	voice, ok := say.GetAttribute("voice")
	assert.True(t, ok)
	assert.Equal(t, "man", voice)
	lang, ok := say.GetAttribute("xml:lang")
	assert.True(t, ok)
	assert.Equal(t, "en", lang)

	dial := children[1]
	assert.Equal(t, "tw", dial.Prefix)
	assert.Equal(t, "urn:tw", dial.Namespace)
	record, ok := dial.GetAttribute("tw:record")
	assert.True(t, ok)
	assert.Equal(t, "true", record)

	assert.Equal(t, document, root.ToXmlDocument())
}

func TestParseXmlErrors(t *testing.T) {
	_, err := ParseXml("<Response>")
	assert.ErrorContains(t, err, "invalid xml")
	_, err = ParseXml("")
	assert.ErrorContains(t, err, "no root element")
	_, err = ParseXml(`<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><Response>&xxe;</Response>`)
	assert.ErrorContains(t, err, "DOCTYPE")
	_, err = ParseXml("<A /><B />")
	assert.ErrorContains(t, err, "multiple root")
}

func TestXmlScalars(t *testing.T) {
	for _, value := range []string{"true", "1"} {
		parsed, err := ParseXmlBool(value)
		require.NoError(t, err)
		assert.True(t, parsed)
	}
	_, err := ParseXmlBool("yes")
	assert.Error(t, err)
	i, err := ParseXmlInt(" 42 ")
	require.NoError(t, err)
	assert.Equal(t, 42, i)
	_, err = ParseXmlInt("x")
	assert.Error(t, err)
	f, err := ParseXmlFloat64("1.5")
	require.NoError(t, err)
	assert.Equal(t, "1.5", FormatXmlFloat64(f))
	assert.Equal(t, []string{"a", "b"}, SplitXmlList(" a  b ", " "))
	assert.Nil(t, SplitXmlList("", " "))
}

type nilNode struct{}

func (nilNode) ToXmlElement() *XmlElement { return nil }

func TestXmlElementSkipsNilChildren(t *testing.T) {
	element := NewXmlElement("A").AddChild(nil).AddChild(nilNode{})
	assert.Equal(t, "<A />", element.ToXml())
}

func TestParseXmlPrefixRedeclaration(t *testing.T) {
	document := `<a:R xmlns:a="urn:x"><b:C xmlns:b="urn:x" b:k="v" /></a:R>`
	parsed, err := ParseXml(document)
	require.NoError(t, err)
	assert.Equal(t, "a", parsed.Prefix)
	child := parsed.ChildElements()[0]
	assert.Equal(t, "b", child.Prefix)
	assert.Equal(t, "b:k", child.Attributes[0].Name)
	assert.Equal(t, `<a:R xmlns:a="urn:x"><b:C xmlns:b="urn:x" b:k="v" /></a:R>`, parsed.ToXml())

	rebound, err := ParseXml(`<foo:R xmlns:foo="http://www.w3.org/XML/1998/namespace" />`)
	require.NoError(t, err)
	assert.Equal(t, "foo", rebound.Prefix)
}

func TestXmlDefaultNamespaceReset(t *testing.T) {
	parent := &XmlElement{Name: "R", Namespace: "urn:x"}
	parent.AddChild(NewXmlElement("C"))
	serialized := parent.ToXml()
	assert.Equal(t, `<R xmlns="urn:x"><C xmlns="" /></R>`, serialized)
	parsed, err := ParseXml(serialized)
	require.NoError(t, err)
	assert.Equal(t, "", parsed.ChildElements()[0].Namespace)
}

func TestXmlRootErrorNil(t *testing.T) {
	assert.EqualError(t, XmlRootError("R", nil), "expected root element <R>, got nil")
}

func TestTakeXmlElementAndMerge(t *testing.T) {
	nodes := []XmlNode{NewXmlElement("A"), NewXmlElement("W").SetAttribute("k", "v").AddChild(NewXmlElement("X")), NewXmlElement("B")}
	taken, rest := TakeXmlElement(nodes, "W")
	require.NotNil(t, taken)
	assert.Len(t, rest, 2)
	merged := NewXmlElement("W").AddChild(NewXmlElement("Y")).Merge(taken)
	assert.Equal(t, `<W k="v"><Y /><X /></W>`, merged.ToXml())
	none, same := TakeXmlElement(nodes, "Z")
	assert.Nil(t, none)
	assert.Len(t, same, 3)
}
