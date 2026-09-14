"""XML runtime for the generated TwiML builders."""

import json
import typing
import xml.etree.ElementTree as ET

XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>'

TwiMLChild = typing.Union["TwiML", str]
T = typing.TypeVar("T", bound=TwiMLChild)


class TwiMLException(Exception):
    """Raised when a TwiML document is constructed incorrectly."""


def lower_camel(name: str) -> str:
    """Convert a snake_case keyword argument into a lowerCamelCase XML attribute name."""
    head, *rest = name.rstrip("_").split("_")
    return head + "".join(part[:1].upper() + part[1:] for part in rest)


def format_value(value: typing.Any) -> str:
    """Serialize a Python value into the string form TwiML expects for attributes."""
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, dict):
        return json.dumps(value)
    if isinstance(value, (list, tuple)):
        return " ".join(format_value(item) for item in value)
    return str(value)


class TwiML:
    """Base class for every TwiML element."""

    name: str = "TwiML"
    ATTRIBUTE_NAMES: typing.ClassVar[typing.Dict[str, str]] = {}

    def __init__(self, **kwargs: typing.Any) -> None:
        self.value: typing.Optional[str] = None
        self.verbs: typing.List[TwiMLChild] = []
        self.attrs: typing.Dict[str, typing.Any] = {}
        for key, attribute in kwargs.items():
            if attribute is not None:
                self.attrs[self.ATTRIBUTE_NAMES.get(key, lower_camel(key))] = attribute

    def __str__(self) -> str:
        return self.to_xml()

    def to_xml(self, xml_declaration: bool = True) -> str:
        """Render this element (and its children) as a TwiML document."""
        xml = ET.tostring(self.xml(), encoding="unicode")
        return XML_DECLARATION + xml if xml_declaration else xml

    def xml(self) -> ET.Element:
        """Build the ElementTree node for this element."""
        element = ET.Element(self.name)
        for attribute, value in self.attrs.items():
            element.set(attribute, format_value(value))
        if self.value is not None:
            element.text = self.value
        for verb in self.verbs:
            if isinstance(verb, str):
                _append_text(element, verb)
            else:
                element.append(verb.xml())
        return element

    def nest(self, verb: T) -> T:
        """Attach a child element (or a text fragment) and return it for further chaining."""
        if not isinstance(verb, (TwiML, str)):
            raise TwiMLException("Only nesting of TwiML and strings are allowed")
        self.verbs.append(verb)
        return verb

    def append(self, verb: TwiMLChild) -> "TwiML":
        """Attach a child element (or a text fragment) and return this element."""
        self.nest(verb)
        return self

    def add_text(self, text: str) -> "TwiML":
        """Append a text fragment after any children added so far."""
        return self.append(text)

    def add_child(self, name: str, value: typing.Optional[str] = None, **kwargs: typing.Any) -> "GenericNode":
        """Attach an arbitrary element that has no generated builder."""
        return self.nest(GenericNode(name, value, **kwargs))


class GenericNode(TwiML):
    """An element identified only by its tag name; used as the escape hatch for unmodelled TwiML."""

    def __init__(self, name: str, value: typing.Optional[str] = None, **kwargs: typing.Any) -> None:
        super().__init__(**kwargs)
        self.name = name
        self.value = value


def _append_text(element: ET.Element, text: str) -> None:
    if len(element) > 0:
        last_child = element[-1]
        last_child.tail = (last_child.tail or "") + text
    else:
        element.text = (element.text or "") + text
