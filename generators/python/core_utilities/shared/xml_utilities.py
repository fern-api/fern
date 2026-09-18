import datetime as dt
import enum
import re
import uuid
from dataclasses import dataclass, field
from typing import (
    Any,
    Collection,
    Dict,
    Iterable,
    List,
    Mapping,
    Optional,
    Protocol,
    Sequence,
    Type,
    TypeVar,
    Union,
    runtime_checkable,
)
from xml.dom import minidom
from xml.parsers.expat import ExpatError
from xml.sax.saxutils import escape, quoteattr

import pydantic
from .pydantic_utilities import IS_PYDANTIC_V2

XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>'

# minidom parses without namespace processing, so tag/attribute names keep their `prefix:` verbatim.
XmlNode = minidom.Element
ModelT = TypeVar("ModelT", bound=pydantic.BaseModel)

_DOCTYPE_PATTERN = re.compile(r"<!DOCTYPE", re.IGNORECASE)
_DEFAULT_LIST_SEPARATOR = " "


class XmlSerializable(Protocol):
    def to_xml(self, *, xml_declaration: bool = False) -> str: ...


@runtime_checkable
class XmlParsable(Protocol):
    @classmethod
    def from_xml(cls, xml: Union[str, XmlNode]) -> Any: ...


XmlScalar = Union[str, int, float, bool, enum.Enum, dt.datetime, dt.date, uuid.UUID]
_SCALAR_TYPES = (str, int, float, bool, enum.Enum, dt.datetime, dt.date, uuid.UUID)
XmlAttributeValue = Optional[Union[XmlScalar, Sequence[XmlScalar]]]
XmlChildValue = Optional[Union[XmlScalar, XmlSerializable, Sequence[Union[XmlScalar, XmlSerializable]]]]


@dataclass(frozen=True)
class XmlAttribute:
    name: str
    value: XmlAttributeValue
    # Joins list values into a single attribute value (e.g. " " for space-delimited lists).
    separator: Optional[str] = None


@dataclass(frozen=True)
class XmlChild:
    # Element name used for primitive values and for the wrapper element of wrapped lists.
    # Values that are themselves XmlSerializable render with their own element name.
    name: str
    value: XmlChildValue
    wrapped: bool = False


def serialize_xml_element(
    *,
    name: str,
    attributes: Sequence[XmlAttribute] = (),
    text: Optional[Union[XmlScalar, Sequence[XmlScalar]]] = None,
    text_separator: Optional[str] = None,
    children: Sequence[XmlChild] = (),
    additional_children: Sequence[XmlSerializable] = (),
    namespace: Optional[str] = None,
    prefix: Optional[str] = None,
    xml_declaration: bool = False,
) -> str:
    tag = f"{prefix}:{name}" if prefix else name
    parts: List[str] = [f"<{tag}"]
    if namespace is not None:
        parts.append(f" {'xmlns:' + prefix if prefix else 'xmlns'}={quoteattr(namespace)}")
    for attribute in attributes:
        rendered = _join_scalars(attribute.value, attribute.separator)
        if rendered is not None:
            parts.append(f" {attribute.name}={quoteattr(rendered)}")

    body: List[str] = []
    rendered_text = _join_scalars(text, text_separator)
    if rendered_text is not None:
        body.append(escape(rendered_text))
    for child in children:
        body.extend(_render_child(child))
    body.extend(extra.to_xml() for extra in additional_children)

    if not body:
        parts.append(" />")
    else:
        parts.append(">")
        parts.extend(body)
        parts.append(f"</{tag}>")

    element = "".join(parts)
    return f"{XML_DECLARATION}{element}" if xml_declaration else element


def append_xml_child(parent: object, field_name: str, child: object) -> None:
    """Appends `child` to the list-valued `field_name` of `parent`, creating the list if unset.

    Bypasses pydantic's frozen-model guard so fluent builder methods can grow a
    model in place (the mutation is confined to the children list).
    """
    current = parent.__dict__.get(field_name)
    updated = [*current, child] if current is not None else [child]
    object.__setattr__(parent, field_name, updated)


@dataclass
class XmlElement:
    """An arbitrary XML element, used to carry child elements the schema does not know about."""

    name: str
    attributes: Dict[str, str] = field(default_factory=dict)
    text: Optional[str] = None
    children: List["XmlElement"] = field(default_factory=list)

    def to_xml(self, *, xml_declaration: bool = False) -> str:
        return serialize_xml_element(
            name=self.name,
            attributes=[XmlAttribute(name=key, value=value) for key, value in self.attributes.items()],
            text=self.text,
            additional_children=self.children,
            xml_declaration=xml_declaration,
        )

    def __str__(self) -> str:
        return self.to_xml()

    @classmethod
    def from_xml(cls, xml: Union[str, XmlNode]) -> "XmlElement":
        node = parse_xml(xml)
        return cls(
            name=node.tagName,
            attributes=_attributes(node),
            text=_direct_text(node),
            children=[cls.from_xml(child) for child in _child_nodes(node)],
        )


def parse_xml(xml: Union[str, XmlNode], name: Optional[str] = None) -> XmlNode:
    """Parses an XML document into its root element, optionally checking the root's (prefix-less) name.

    Documents with a DTD are rejected so entity expansion attacks cannot reach the parser.
    Raises `ValueError` on malformed input or an unexpected root element.
    """
    node: XmlNode
    if isinstance(xml, str):
        if _DOCTYPE_PATTERN.search(xml):
            raise ValueError("Failed to parse XML: DOCTYPE declarations are not allowed")
        try:
            node = minidom.parseString(xml).documentElement
        except ExpatError as e:
            raise ValueError(f"Failed to parse XML: {e}") from e
    else:
        node = xml
    if name is not None and _local_name(node.tagName) != name:
        raise ValueError(f"Expected <{name}> element but found <{node.tagName}>")
    return node


def xml_attribute(node: XmlNode, name: str, *, separator: Optional[str] = None) -> Optional[Union[str, List[str]]]:
    """Returns the raw attribute value, split into a list when `separator` is given."""
    if not node.hasAttribute(name):
        return None
    value = node.getAttribute(name)
    return _split(value, separator) if separator is not None else value


def xml_text(node: XmlNode, *, separator: Optional[str] = None) -> Optional[Union[str, List[str]]]:
    """Returns the element's direct text content, split into a list when `separator` is given."""
    text = _direct_text(node)
    if text is None:
        return None
    return _split(text, separator) if separator is not None else text


def xml_children(
    node: XmlNode,
    types: Mapping[str, type],
    *,
    wrapper: Optional[str] = None,
    optional: bool = False,
) -> Optional[List[Any]]:
    """Parses the child elements named in `types` (tag -> model class or scalar type), in document order.

    Xml-encoded models are built via their `from_xml`; other types receive the child's text and are
    converted by the parent model's validation. With `wrapper`, children are read from that single
    wrapper element instead. When `optional`, None is returned if the wrapper (or any child) is absent.
    """
    container = node
    if wrapper is not None:
        wrapper_node = next((child for child in _child_nodes(node) if _local_name(child.tagName) == wrapper), None)
        if wrapper_node is None:
            return None if optional else []
        container = wrapper_node
    items: List[Any] = []
    for child in _child_nodes(container):
        child_type = types.get(_local_name(child.tagName))
        if child_type is None:
            continue
        items.append(child_type.from_xml(child) if issubclass(child_type, XmlParsable) else _direct_text(child))
    if optional and wrapper is None and not items:
        return None
    return items


def xml_child(node: XmlNode, types: Mapping[str, type]) -> Optional[Any]:
    """Parses the first child element named in `types`, if any."""
    items = xml_children(node, types)
    return items[0] if items else None


def build_xml_model(
    model: Type[ModelT], fields: Mapping[str, object], node: XmlNode, attribute_names: Collection[str]
) -> ModelT:
    """Constructs `model` from raw parsed XML values (validated by the model) plus the node's undeclared attributes."""
    return model(**fields, **xml_extra_attributes(node, attribute_names))


def xml_extra_attributes(node: XmlNode, known_names: Collection[str]) -> Dict[str, str]:
    """Returns every attribute not in `known_names`, excluding namespace declarations."""
    return {
        name: value
        for name, value in _attributes(node).items()
        if not (name == "xmlns" or name.startswith("xmlns:") or name in known_names)
    }


def xml_unknown_children(node: XmlNode, known_names: Collection[str]) -> List[XmlElement]:
    """Returns every direct child element whose (prefix-less) name is not in `known_names`."""
    return [XmlElement.from_xml(child) for child in _child_nodes(node) if _local_name(child.tagName) not in known_names]


def _attributes(node: XmlNode) -> Dict[str, str]:
    """All attributes in document order, namespace declarations included."""
    attributes = node.attributes
    result: Dict[str, str] = {}
    for index in range(attributes.length):
        attribute: minidom.Attr = attributes.item(index)  # type: ignore[no-untyped-call]
        result[attribute.name] = attribute.value
    return result


def _direct_text(node: XmlNode) -> Optional[str]:
    """Concatenated direct text of the element; whitespace-only content counts as absent."""
    text = "".join(
        child.data
        for child in node.childNodes
        if child.nodeType in (minidom.Node.TEXT_NODE, minidom.Node.CDATA_SECTION_NODE)
    )
    return text if text.strip() else None


def _child_nodes(node: XmlNode) -> List[XmlNode]:
    return [child for child in node.childNodes if child.nodeType == minidom.Node.ELEMENT_NODE]


def _local_name(tag: str) -> str:
    return tag.split(":", 1)[1] if ":" in tag else tag


def _split(value: str, separator: str) -> List[str]:
    return [item for item in value.split(separator or _DEFAULT_LIST_SEPARATOR) if item != ""]


def extra_xml_attributes(model: pydantic.BaseModel) -> List[XmlAttribute]:
    """Renders fields that were passed to the model but are not declared on it as XML attributes.

    Lets callers set attributes the schema does not know about (`Say("hi", foo="bar")` -> `<Say foo="bar">`).
    """
    if IS_PYDANTIC_V2:
        extras = model.model_extra or {}  # type: ignore[attr-defined]
    else:
        declared = set(model.__fields__)  # type: ignore[attr-defined]
        extras = {key: value for key, value in model.__dict__.items() if key not in declared}
    return [XmlAttribute(name=key, value=value) for key, value in extras.items() if value is not None]


def _join_scalars(value: XmlAttributeValue, separator: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, _SCALAR_TYPES):
        return _scalar_to_string(value)
    items = [_scalar_to_string(item) for item in value if item is not None]
    if not items:
        return None
    return (separator or " ").join(items)


def _render_child(child: XmlChild) -> Iterable[str]:
    value = child.value
    if value is None:
        return []
    items: Sequence[Union[XmlScalar, XmlSerializable]]
    # Scalars are checked first so `str` is not treated as a sequence.
    if isinstance(value, _SCALAR_TYPES):
        items = [value]
    elif isinstance(value, Sequence):
        items = value
    else:
        items = [value]
    rendered = [_render_child_item(child.name, item) for item in items if item is not None]
    if child.wrapped:
        return [f"<{child.name}>{''.join(rendered)}</{child.name}>"] if rendered else [f"<{child.name} />"]
    return rendered


def _render_child_item(name: str, item: Union[XmlScalar, XmlSerializable]) -> str:
    if isinstance(item, _SCALAR_TYPES):
        return f"<{name}>{escape(_scalar_to_string(item))}</{name}>"
    if not hasattr(item, "to_xml"):
        raise TypeError(
            f"Cannot serialize <{name}> child of type {type(item).__name__} to XML: "
            "only scalars and xml-encoded models (with a to_xml() method) are supported"
        )
    return item.to_xml()


def _scalar_to_string(value: XmlScalar) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, enum.Enum):
        return str(value.value)
    if isinstance(value, (dt.datetime, dt.date)):
        return value.isoformat()
    return str(value)
