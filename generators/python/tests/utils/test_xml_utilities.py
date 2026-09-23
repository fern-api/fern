import datetime as dt
import enum
import uuid
from typing import List, Optional, Union

import pydantic
import pytest

from core_utilities.shared.pydantic_utilities import IS_PYDANTIC_V2
from core_utilities.shared.xml_utilities import (
    XML_DECLARATION,
    append_xml_child,
    build_xml_model,
    extra_xml_attributes,
    XmlAttribute,
    XmlChild,
    XmlElement,
    XmlNode,
    parse_xml,
    serialize_xml_element,
    xml_attribute,
    xml_child,
    xml_children,
    xml_extra_attributes,
    xml_text,
    xml_unknown_children,
)


class Voice(str, enum.Enum):
    JOANNA = "Polly.Joanna"


class Say:
    def __init__(self, message: str) -> None:
        self.message = message

    def __eq__(self, other: object) -> bool:
        return isinstance(other, Say) and other.message == self.message

    def to_xml(self, *, xml_declaration: bool = False) -> str:
        return serialize_xml_element(name="Say", text=self.message, xml_declaration=xml_declaration)

    @classmethod
    def from_xml(cls, xml: Union[str, XmlNode]) -> "Say":
        node = parse_xml(xml, "Say")
        text = xml_text(node)
        assert isinstance(text, str)
        return cls(text)


def test_empty_element_is_self_closing() -> None:
    assert serialize_xml_element(name="Hangup") == "<Hangup />"


def test_attributes_skip_none_and_render_scalars() -> None:
    xml = serialize_xml_element(
        name="Say",
        attributes=[
            XmlAttribute(name="voice", value=Voice.JOANNA),
            XmlAttribute(name="loop", value=2),
            XmlAttribute(name="language", value=None),
            XmlAttribute(name="record", value=True),
            XmlAttribute(name="at", value=dt.date(2024, 1, 2)),
        ],
    )
    assert xml == '<Say voice="Polly.Joanna" loop="2" record="true" at="2024-01-02" />'


def test_attribute_lists_join_with_separator() -> None:
    xml = serialize_xml_element(
        name="Dial",
        attributes=[XmlAttribute(name="events", value=["initiated", "answered"], separator=" ")],
    )
    assert xml == '<Dial events="initiated answered" />'


def test_text_and_attribute_values_are_escaped() -> None:
    xml = serialize_xml_element(
        name="Say",
        attributes=[XmlAttribute(name="voice", value='a"b<c')],
        text="Tom & Jerry <3",
    )
    assert xml == '<Say voice=\'a"b&lt;c\'>Tom &amp; Jerry &lt;3</Say>'


def test_nested_serializable_children_and_primitive_children() -> None:
    xml = serialize_xml_element(
        name="Response",
        children=[
            XmlChild(name="children", value=[Say("hi"), Say("bye")]),
            XmlChild(name="Number", value="+15551234567"),
            XmlChild(name="Missing", value=None),
        ],
    )
    assert xml == "<Response><Say>hi</Say><Say>bye</Say><Number>+15551234567</Number></Response>"


def test_wrapped_list_children() -> None:
    xml = serialize_xml_element(
        name="Dial",
        children=[XmlChild(name="Numbers", value=["+1", "+2"], wrapped=True)],
    )
    assert xml == "<Dial><Numbers><Numbers>+1</Numbers><Numbers>+2</Numbers></Numbers></Dial>"


def test_namespace_prefix_and_declaration() -> None:
    xml = serialize_xml_element(
        name="Dial",
        namespace="https://www.twilio.com/twiml",
        prefix="tw",
        xml_declaration=True,
    )
    assert xml == f'{XML_DECLARATION}<tw:Dial xmlns:tw="https://www.twilio.com/twiml" />'


def test_append_xml_child_on_frozen_model() -> None:
    if IS_PYDANTIC_V2:

        class Response(pydantic.BaseModel):
            model_config = pydantic.ConfigDict(frozen=True, arbitrary_types_allowed=True)
            children: Optional[List[Say]] = None

    else:

        class Response(pydantic.BaseModel):  # type: ignore[no-redef]
            children: Optional[List[Say]] = None

            class Config:
                frozen = True
                arbitrary_types_allowed = True

    response = Response()
    append_xml_child(response, "children", Say("hi"))
    append_xml_child(response, "children", Say("bye"))
    assert response.children == [Say("hi"), Say("bye")]


def test_extra_xml_attributes_renders_undeclared_fields_escaped() -> None:
    if IS_PYDANTIC_V2:

        class Say(pydantic.BaseModel):
            model_config = pydantic.ConfigDict(extra="allow")
            message: Optional[str] = None
            voice: Optional[str] = None

    else:

        class Say(pydantic.BaseModel):  # type: ignore[no-redef]
            message: Optional[str] = None
            voice: Optional[str] = None

            class Config:
                extra = pydantic.Extra.allow

    say = Say(**{"message": "hi", "foo": "a<b&c", "skipped": None})
    xml = serialize_xml_element(
        name="Say",
        attributes=[XmlAttribute(name="voice", value=say.voice), *extra_xml_attributes(say)],
        text=say.message,
    )
    assert xml == '<Say foo="a&lt;b&amp;c">hi</Say>'


def test_uuid_values_render_as_scalars() -> None:
    value = uuid.UUID("123e4567-e89b-12d3-a456-426614174000")
    assert (
        serialize_xml_element(
            name="Item",
            attributes=[XmlAttribute(name="id", value=value)],
            children=[XmlChild(name="Ref", value=value)],
        )
        == f'<Item id="{value}"><Ref>{value}</Ref></Item>'
    )


def test_text_lists_join_with_separator() -> None:
    assert (
        serialize_xml_element(name="Gather", text=["speech", "dtmf"], text_separator=" ")
        == "<Gather>speech dtmf</Gather>"
    )


def test_non_serializable_child_raises() -> None:
    class Plain(pydantic.BaseModel):
        name: str

    with pytest.raises(TypeError, match="<customer> child of type Plain"):
        serialize_xml_element(name="Envelope", children=[XmlChild(name="customer", value=Plain(name="Ada"))])  # type: ignore[arg-type]


def test_parse_xml_validates_root_and_strips_prefix() -> None:
    node = parse_xml('<tw:Dial xmlns:tw="https://www.twilio.com/twiml" callerId="+1555" />', "Dial")
    assert node.tagName == "tw:Dial"
    with pytest.raises(ValueError, match="Expected <Response> element but found <Say>"):
        parse_xml("<Say>hi</Say>", "Response")


def test_parse_xml_rejects_malformed_and_doctype() -> None:
    with pytest.raises(ValueError, match="Failed to parse XML"):
        parse_xml("<Response><Say>")
    with pytest.raises(ValueError, match="DOCTYPE"):
        parse_xml('<!DOCTYPE r [<!ENTITY e SYSTEM "file:///etc/passwd">]><Response>&e;</Response>')


def test_xml_attribute_and_text_with_separators() -> None:
    node = parse_xml('<Gather input="speech  dtmf" numDigits="1">a b</Gather>')
    assert xml_attribute(node, "numDigits") == "1"
    assert xml_attribute(node, "missing") is None
    assert xml_attribute(node, "input", separator=" ") == ["speech", "dtmf"]
    assert xml_text(node) == "a b"
    assert xml_text(node, separator=" ") == ["a", "b"]
    assert xml_text(parse_xml("<Say>  <break/>  </Say>")) is None
    assert xml_text(parse_xml("<Say><![CDATA[<b>]]> &amp; x</Say>")) == "<b> & x"


def test_xml_children_dispatch_by_tag_in_document_order() -> None:
    node = parse_xml("<Response><Say>one</Say><Other/><Say>two</Say></Response>")
    assert xml_children(node, {"Say": Say}) == [Say("one"), Say("two")]
    assert xml_child(node, {"Say": Say}) == Say("one")
    assert xml_child(node, {"Missing": Say}) is None
    assert xml_children(node, {"Missing": Say}) == []
    assert xml_children(node, {"Missing": Say}, optional=True) is None


def test_xml_children_scalars_and_wrappers() -> None:
    node = parse_xml("<Dial><Numbers><Number>+1</Number><Number>+2</Number></Numbers><Tag>x</Tag></Dial>")
    assert xml_children(node, {"Number": str}, wrapper="Numbers") == ["+1", "+2"]
    assert xml_children(node, {"Tag": str}) == ["x"]
    assert xml_children(node, {"Number": str}, wrapper="Absent") == []
    assert xml_children(node, {"Number": str}, wrapper="Absent", optional=True) is None
    assert xml_children(parse_xml("<Dial><Numbers/></Dial>"), {"Number": str}, wrapper="Numbers", optional=True) == []


def test_xml_extra_attributes_and_unknown_children() -> None:
    node = parse_xml(
        '<Say xmlns:tw="urn:x" voice="man" foo="bar" xml:lang="fr-FR">hi'
        '<break time="1s"/><Brandnew k="v">text<Inner/></Brandnew></Say>'
    )
    assert xml_extra_attributes(node, {"voice"}) == {"foo": "bar", "xml:lang": "fr-FR"}
    unknown = xml_unknown_children(node, {"break"})
    assert unknown == [
        XmlElement(name="Brandnew", attributes={"k": "v"}, text="text", children=[XmlElement(name="Inner")])
    ]
    assert unknown[0].to_xml() == '<Brandnew k="v">text<Inner /></Brandnew>'


def test_xml_element_round_trips_and_is_rendered_after_typed_children() -> None:
    element = XmlElement.from_xml('<a:Foo xmlns:a="urn:a" k="&lt;v&gt;">t &amp; u<Bar/></a:Foo>')
    assert element == XmlElement(
        name="a:Foo", attributes={"xmlns:a": "urn:a", "k": "<v>"}, text="t & u", children=[XmlElement(name="Bar")]
    )
    assert XmlElement.from_xml(element.to_xml()) == element
    xml = serialize_xml_element(
        name="Response",
        children=[XmlChild(name="Say", value=Say("hi"))],
        additional_children=[XmlElement(name="Brandnew")],
    )
    assert xml == "<Response><Say>hi</Say><Brandnew /></Response>"


def test_build_xml_model_validates_fields_and_keeps_extra_attributes() -> None:
    class Pause(pydantic.BaseModel):
        length: Optional[int] = None

        if IS_PYDANTIC_V2:
            model_config = pydantic.ConfigDict(extra="allow")  # type: ignore[typeddict-unknown-key]
        else:

            class Config:
                extra = pydantic.Extra.allow

    node = parse_xml('<Pause length="3" foo="bar" />')
    model = build_xml_model(Pause, dict(length=xml_attribute(node, "length")), node, {"length"})
    assert model.length == 3
    assert [(a.name, a.value) for a in extra_xml_attributes(model)] == [("foo", "bar")]
    with pytest.raises(ValueError):
        build_xml_model(Pause, dict(length="x"), node, {"length"})
