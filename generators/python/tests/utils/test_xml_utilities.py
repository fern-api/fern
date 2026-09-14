import datetime as dt
import enum

from core_utilities.shared.xml_utilities import (
    XML_DECLARATION,
    XmlAttribute,
    XmlChild,
    serialize_xml_element,
)


class Voice(str, enum.Enum):
    JOANNA = "Polly.Joanna"


class Say:
    def __init__(self, message: str) -> None:
        self.message = message

    def to_xml(self, *, xml_declaration: bool = False) -> str:
        return serialize_xml_element(name="Say", text=self.message, xml_declaration=xml_declaration)


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
