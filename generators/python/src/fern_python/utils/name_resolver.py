"""
Helpers for IR v66 compressed Name types.

In IR v66, Name fields may be compressed to plain strings (NameOrString = str | Name).
Similarly, NameAndWireValue fields may be compressed (NameAndWireValueOrString = str | NameAndWireValue).
These helpers safely access properties regardless of whether the value is compressed.
"""

import keyword
from typing import Union

import fern.ir.resources as ir_types

from .snake_case import snake_case as to_snake
from .pascal_case import pascal_case as to_pascal


def _to_camel(s: str) -> str:
    snake = to_snake(s)
    parts = snake.split("_")
    if not parts:
        return ""
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


def _to_screaming_snake(s: str) -> str:
    return to_snake(s).upper()


def _make_safe(name: str) -> str:
    if keyword.iskeyword(name) or name in ("list", "set", "dict", "type", "id", "hash", "input", "object", "property"):
        return name + "_"
    return name


def resolve_name(name_or_str: Union[str, ir_types.Name]) -> ir_types.Name:
    """Resolve a NameOrString to a full Name object with all casings."""
    if isinstance(name_or_str, ir_types.Name):
        return name_or_str
    s = name_or_str
    snake = to_snake(s)
    pascal = to_pascal(s)
    camel = _to_camel(s)
    screaming = _to_screaming_snake(s)
    return ir_types.Name(
        original_name=s,
        camel_case=ir_types.SafeAndUnsafeString(safe_name=_make_safe(camel), unsafe_name=camel),
        pascal_case=ir_types.SafeAndUnsafeString(safe_name=_make_safe(pascal), unsafe_name=pascal),
        snake_case=ir_types.SafeAndUnsafeString(safe_name=_make_safe(snake), unsafe_name=snake),
        screaming_snake_case=ir_types.SafeAndUnsafeString(safe_name=_make_safe(screaming), unsafe_name=screaming),
    )


def get_wire_value(name_and_wire_value_or_str: Union[str, ir_types.NameAndWireValue]) -> str:
    """Extract the wire value from a NameAndWireValueOrString."""
    if isinstance(name_and_wire_value_or_str, str):
        return name_and_wire_value_or_str
    return name_and_wire_value_or_str.wire_value


def get_name_from_wire_value(
    name_and_wire_value_or_str: Union[str, ir_types.NameAndWireValue],
) -> Union[str, ir_types.Name]:
    """Extract the inner Name (or string) from a NameAndWireValueOrString."""
    if isinstance(name_and_wire_value_or_str, str):
        return name_and_wire_value_or_str
    return name_and_wire_value_or_str.name


def get_original_name(name_or_str: Union[str, ir_types.Name]) -> str:
    """Extract the original name from a NameOrString."""
    if isinstance(name_or_str, str):
        return name_or_str
    return name_or_str.original_name
