# nopycln: file
import datetime as dt
import os
import typing
from collections import defaultdict

import typing_extensions

import pydantic

IS_PYDANTIC_V2 = pydantic.VERSION.startswith("2.")

from .datetime_utils import serialize_datetime

# isort will try to reformat the comments on these imports, which breaks mypy
# isort: off
from pydantic.v1.datetime_parse import (  # type: ignore # pyright: ignore[reportMissingImports] # Pydantic v2
    parse_date as parse_date,
)
from pydantic.v1.datetime_parse import (  # pyright: ignore[reportMissingImports] # Pydantic v2
    parse_datetime as parse_datetime,
)
from pydantic.v1.json import (  # type: ignore # pyright: ignore[reportMissingImports] # Pydantic v2
    ENCODERS_BY_TYPE as encoders_by_type,
)
from pydantic.v1.typing import (  # type: ignore # pyright: ignore[reportMissingImports] # Pydantic v2
    get_args as get_args,
)
from pydantic.v1.typing import (  # pyright: ignore[reportMissingImports] # Pydantic v2
    get_origin as get_origin,
)
from pydantic.v1.typing import (  # pyright: ignore[reportMissingImports] # Pydantic v2
    is_literal_type as is_literal_type,
)
from pydantic.v1.typing import (  # pyright: ignore[reportMissingImports] # Pydantic v2
    is_union as is_union,
)
from pydantic.v1.fields import ModelField as ModelField  # type: ignore # pyright: ignore[reportMissingImports] # Pydantic v2


T = typing.TypeVar("T")
Model = typing.TypeVar("Model", bound=pydantic.BaseModel)


def parse_obj_as(type_: typing.Type[T], object_: typing.Any) -> T:
    return pydantic.v1.parse_obj_as(type_, object_)


def to_jsonable_with_fallback(
    obj: typing.Any, fallback_serializer: typing.Callable[[typing.Any], typing.Any]
) -> typing.Any:
    return fallback_serializer(obj)


class UniversalBaseModel(pydantic.v1.BaseModel):
    class Config:
        populate_by_name = True
        smart_union = True
        allow_population_by_field_name = True
        json_encoders = {dt.datetime: serialize_datetime}
        # Allow fields beginning with `model_` to be used in the model
        protected_namespaces = ()

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {
            "by_alias": True,
            "exclude_unset": True,
            **kwargs,
        }
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        """
        Override the default dict method to `exclude_unset` by default. This function patches
        `exclude_unset` to work include fields within non-None default values.
        """
        # Note: the logic here is multiplexed given the levers exposed in Pydantic V1 vs V2
        # Pydantic V1's .dict can be extremely slow, so we do not want to call it twice.
        #
        # We'd ideally do the same for Pydantic V2, but it shells out to a library to serialize models
        # that we have less control over, and this is less intrusive than custom serializers for now.
        _fields_set = self.__fields_set__.copy()

        fields = _get_model_fields(self.__class__)
        for name, field in fields.items():
            if name not in _fields_set:
                default = _get_field_default(field)

                # If the default values are non-null act like they've been set
                # This effectively allows exclude_unset to work like exclude_none where
                # the latter passes through intentionally set none values.
                if default is not None or ("exclude_unset" in kwargs and not kwargs["exclude_unset"]):
                    _fields_set.add(name)

                    if default is not None:
                        self.__fields_set__.add(name)

        kwargs_with_defaults_exclude_unset_include_fields: typing.Any = {
            "by_alias": True,
            "exclude_unset": True,
            "include": _fields_set,
            **kwargs,
        }

        return super().dict(**kwargs_with_defaults_exclude_unset_include_fields)


def _union_list_of_pydantic_dicts(
    source: typing.List[typing.Any], destination: typing.List[typing.Any]
) -> typing.List[typing.Any]:
    converted_list: typing.List[typing.Any] = []
    for i, item in enumerate(source):
        destination_value = destination[i]  # type: ignore
        if isinstance(item, dict):
            converted_list.append(deep_union_pydantic_dicts(item, destination_value))
        elif isinstance(item, list):
            converted_list.append(_union_list_of_pydantic_dicts(item, destination_value))
        else:
            converted_list.append(item)
    return converted_list


def deep_union_pydantic_dicts(
    source: typing.Dict[str, typing.Any], destination: typing.Dict[str, typing.Any]
) -> typing.Dict[str, typing.Any]:
    for key, value in source.items():
        node = destination.setdefault(key, {})
        if isinstance(value, dict):
            deep_union_pydantic_dicts(value, node)
        # Note: we do not do this same processing for sets given we do not have sets of models
        # and given the sets are unordered, the processing of the set and matching objects would
        # be non-trivial.
        elif isinstance(value, list):
            destination[key] = _union_list_of_pydantic_dicts(value, node)
        else:
            destination[key] = value

    return destination


UniversalRootModel: typing_extensions.TypeAlias = UniversalBaseModel  # type: ignore


def encode_by_type(o: typing.Any) -> typing.Any:
    encoders_by_class_tuples: typing.Dict[
        typing.Callable[[typing.Any], typing.Any], typing.Tuple[typing.Any, ...]
    ] = defaultdict(tuple)
    for type_, encoder in encoders_by_type.items():
        encoders_by_class_tuples[encoder] += (type_,)

    if type(o) in encoders_by_type:
        return encoders_by_type[type(o)](o)
    for encoder, classes_tuple in encoders_by_class_tuples.items():
        if isinstance(o, classes_tuple):
            return encoder(o)


def update_forward_refs(model: typing.Type["Model"], **localns: typing.Any) -> None:
    model.update_forward_refs(**localns)


# Mirrors Pydantic's internal typing
AnyCallable = typing.Callable[..., typing.Any]


def universal_root_validator(
    pre: bool = False,
) -> typing.Callable[[AnyCallable], AnyCallable]:
    def decorator(func: AnyCallable) -> AnyCallable:
        return pydantic.v1.root_validator(pre=pre)(func)  # type: ignore # Pydantic v1

    return decorator


def universal_field_validator(field_name: str, pre: bool = False) -> typing.Callable[[AnyCallable], AnyCallable]:
    def decorator(func: AnyCallable) -> AnyCallable:
        return pydantic.v1.validator(field_name, pre=pre)(func)  # type: ignore # Pydantic v1

    return decorator


PydanticField = typing.Union[ModelField, pydantic.fields.FieldInfo]


def _get_model_fields(
    model: typing.Type["Model"],
) -> typing.Mapping[str, PydanticField]:
    return model.__fields__  # type: ignore # Pydantic v1


def _get_field_default(field: PydanticField) -> typing.Any:
    try:
        value = field.get_default()  # type: ignore # Pydantic < v1.10.15
    except:
        value = field.default
    return value
