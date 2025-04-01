from __future__ import annotations

import sys
import typing
from collections import abc as _c_abc
from typing import Any, Iterable, TypeVar, cast

import typing_extensions
from typing_extensions import (
    Annotated,
    Mapping,
    Required,
    TypeGuard,
    TypeIs,
    get_args,
    get_origin,
)

from .pydantic_utilities import is_union

_TYPE_ALIAS_TYPES: tuple[type[typing_extensions.TypeAliasType], ...] = (
    typing_extensions.TypeAliasType,
)
if sys.version_info >= (3, 12):
    _TYPE_ALIAS_TYPES = (*_TYPE_ALIAS_TYPES, typing.TypeAliasType)


def is_list(obj: object) -> TypeGuard[list[object]]:
    return isinstance(obj, list)


def is_mapping(obj: object) -> TypeGuard[Mapping[str, object]]:
    return isinstance(obj, Mapping)


def is_annotated_type(typ: type) -> bool:
    return get_origin(typ) == Annotated


def is_list_type(typ: type) -> bool:
    return (get_origin(typ) or typ) == list


def is_iterable_type(typ: type) -> bool:
    origin = get_origin(typ) or typ
    return origin == Iterable or origin == _c_abc.Iterable


def is_union_type(typ: type) -> bool:
    return is_union(get_origin(typ))


def is_required_type(typ: type) -> bool:
    return get_origin(typ) == Required


def is_typevar(typ: type) -> bool:
    return type(typ) == TypeVar  # type: ignore


def is_type_alias_type(tp: Any, /) -> TypeIs[typing_extensions.TypeAliasType]:
    """Return whether the provided argument is an instance of `TypeAliasType`"""

    return isinstance(tp, _TYPE_ALIAS_TYPES)


def strip_annotated_type(typ: type) -> type:
    """Extracts T from Annotated[T, ...] or from Required[Annotated[T, ...]]"""
    if is_required_type(typ) or is_annotated_type(typ):
        return strip_annotated_type(cast(type, get_args(typ)[0]))

    return typ


def extract_type_arg(typ: type, index: int) -> type:
    args = get_args(typ)
    try:
        return cast(type, args[index])
    except IndexError as err:
        raise RuntimeError(
            f"Expected type {typ} to have a type argument at index {index} but it did not"
        ) from err
