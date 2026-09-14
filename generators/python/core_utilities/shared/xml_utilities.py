import datetime as dt
import enum
from dataclasses import dataclass
from typing import Iterable, List, Optional, Protocol, Sequence, Union, runtime_checkable
from xml.sax.saxutils import escape, quoteattr

XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>'


@runtime_checkable
class XmlSerializable(Protocol):
    def to_xml(self, *, xml_declaration: bool = False) -> str: ...


XmlScalar = Union[str, int, float, bool, enum.Enum, dt.datetime, dt.date]
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
    text: Optional[XmlScalar] = None,
    children: Sequence[XmlChild] = (),
    namespace: Optional[str] = None,
    prefix: Optional[str] = None,
    xml_declaration: bool = False,
) -> str:
    tag = f"{prefix}:{name}" if prefix else name
    parts: List[str] = [f"<{tag}"]
    if namespace is not None:
        parts.append(f" {'xmlns:' + prefix if prefix else 'xmlns'}={quoteattr(namespace)}")
    for attribute in attributes:
        rendered = _render_attribute_value(attribute)
        if rendered is not None:
            parts.append(f" {attribute.name}={quoteattr(rendered)}")

    body: List[str] = []
    if text is not None:
        body.append(escape(_scalar_to_string(text)))
    for child in children:
        body.extend(_render_child(child))

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


def _render_attribute_value(attribute: XmlAttribute) -> Optional[str]:
    value = attribute.value
    if value is None:
        return None
    if isinstance(value, (str, int, float, bool, enum.Enum, dt.datetime, dt.date)):
        return _scalar_to_string(value)
    items = [_scalar_to_string(item) for item in value if item is not None]
    if not items:
        return None
    return (attribute.separator or " ").join(items)


def _render_child(child: XmlChild) -> Iterable[str]:
    value = child.value
    if value is None:
        return []
    items: Sequence[Union[XmlScalar, XmlSerializable]]
    if isinstance(value, (str, int, float, bool, enum.Enum, dt.datetime, dt.date, XmlSerializable)):
        items = [value]
    else:
        items = value
    rendered = [_render_child_item(child.name, item) for item in items if item is not None]
    if child.wrapped:
        return [f"<{child.name}>{''.join(rendered)}</{child.name}>"] if rendered else [f"<{child.name} />"]
    return rendered


def _render_child_item(name: str, item: Union[XmlScalar, XmlSerializable]) -> str:
    if isinstance(item, XmlSerializable):
        return item.to_xml()
    return f"<{name}>{escape(_scalar_to_string(item))}</{name}>"


def _scalar_to_string(value: XmlScalar) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, enum.Enum):
        return str(value.value)
    if isinstance(value, (dt.datetime, dt.date)):
        return value.isoformat()
    return str(value)
