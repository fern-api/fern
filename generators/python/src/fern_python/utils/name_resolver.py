"""
Helpers for IR v66 compressed Name types.

In IR v66, Name fields may be compressed to plain strings (NameOrString = str | Name).
Similarly, NameAndWireValue fields may be compressed (NameAndWireValueOrString = str | NameAndWireValue).
These helpers safely access properties regardless of whether the value is compressed.
"""

import functools
import keyword
import re
from typing import Union

from .pascal_case import pascal_case as to_pascal
from .snake_case import snake_case as to_snake

import fern.ir.resources as ir_types

_LEADING_DIGIT_LOWERCASE = re.compile(r"^(\d+)_([a-z]+)")


def _to_camel(s: str) -> str:
    snake = to_snake(s)
    parts = snake.split("_")
    if not parts:
        return ""
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


def _smart_snake(s: str) -> str:
    """Snake_case for v66-compressed strings, matching IR pre-computed values.

    Mirrors plain lodash ``snakeCase`` (which is what the IR server uses to pre-compute
    Name.snake_case), with one exception: digit-prefixed identifiers like ``3d`` keep
    the digit attached to the following lowercase run (``3d`` not ``3_d``) so
    _make_safe can sanitize them to ``_3d`` and match the canonical IR safe_name.
    """
    snake = "_".join(to_snake(part) for part in s.split(" "))
    if s and s[0].isdigit():
        return _LEADING_DIGIT_LOWERCASE.sub(r"\1\2", snake)
    return snake


def _to_screaming_snake(s: str) -> str:
    return _smart_snake(s).upper()


_PYTHON_RESERVED_BUILTINS = frozenset(
    {
        # Must match @fern-api/casings-generator reserved.ts (Python section) exactly.
        # Do NOT add extras — the IR server computes safe_names using this same set,
        # so any divergence produces different names for v66 compressed strings vs v65
        # pre-computed Names.
        "float",
        "int",
        "complex",
        "bool",
        "uuid",
        "list",
        "set",
        "map",
        "long",
        "self",
        "all",
        "kwargs",
    }
)


def _make_safe(name: str) -> str:
    if keyword.iskeyword(name) or name in _PYTHON_RESERVED_BUILTINS:
        return name + "_"
    # Python identifiers cannot start with a digit. Prefix with "_" to match
    # the canonical sanitizeName behavior in @fern-api/casings-generator;
    # downstream pydantic_model code rewrites leading "_" to "f_".
    if name and name[0].isdigit():
        return "_" + name
    return name


@functools.lru_cache(maxsize=None)
def _resolve_string_name(s: str) -> ir_types.Name:
    snake = _smart_snake(s)
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


def resolve_name(name_or_str: Union[str, ir_types.Name]) -> ir_types.Name:
    """String inputs are cached (lru_cache); Name objects pass through as-is."""
    if isinstance(name_or_str, ir_types.Name):
        return name_or_str
    return _resolve_string_name(name_or_str)


def get_wire_value(name_and_wire_value_or_str: Union[str, ir_types.NameAndWireValue]) -> str:
    if isinstance(name_and_wire_value_or_str, str):
        return name_and_wire_value_or_str
    return name_and_wire_value_or_str.wire_value


def get_name_from_wire_value(
    name_and_wire_value_or_str: Union[str, ir_types.NameAndWireValue],
) -> Union[str, ir_types.Name]:
    if isinstance(name_and_wire_value_or_str, str):
        return name_and_wire_value_or_str
    return name_and_wire_value_or_str.name


def resolve_wire_name(name_and_wire_value_or_str: Union[str, ir_types.NameAndWireValue]) -> ir_types.Name:
    """Shorthand for resolve_name(get_name_from_wire_value(x)) — the most common accessor pattern."""
    return resolve_name(get_name_from_wire_value(name_and_wire_value_or_str))


def get_original_name(name_or_str: Union[str, ir_types.Name]) -> str:
    if isinstance(name_or_str, str):
        return name_or_str
    return name_or_str.original_name
