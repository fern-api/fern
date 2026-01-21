# nopycln: file
import datetime as dt
import json
from collections import defaultdict
from typing import Any, Callable, Dict, List, Mapping, Tuple, Type, TypeVar, Union, cast

import pydantic
from .datetime_utils import serialize_datetime
from pydantic.v1.datetime_parse import parse_date as parse_date
from pydantic.v1.datetime_parse import parse_datetime as parse_datetime
from pydantic.v1.fields import ModelField as ModelField
from pydantic.v1.json import ENCODERS_BY_TYPE as encoders_by_type  # type: ignore[attr-defined]
from pydantic.v1.typing import get_args as get_args
from pydantic.v1.typing import get_origin as get_origin
from pydantic.v1.typing import is_literal_type as is_literal_type
from pydantic.v1.typing import is_union as is_union
from typing_extensions import TypeAlias

T = TypeVar("T")
Model = TypeVar("Model", bound=pydantic.BaseModel)

# Mirrors Pydantic's internal typing
AnyCallable = Callable[..., Any]


def _maybe_parse_json_string(value: Any) -> Any:
    """
    Attempt to parse a string value as JSON if it looks like a JSON object or array.
    This handles cases where nested objects are sent as JSON strings over the wire
    (e.g., in SSE events where the data field contains a stringified JSON object).
    """
    if isinstance(value, str):
        try:
            # Only attempt to parse if it looks like JSON (starts with { or [)
            stripped = value.strip()
            if stripped.startswith(("{", "[")):
                return json.loads(value)
        except (json.JSONDecodeError, ValueError):
            pass
    return value


def parse_obj_as(type_: Type[T], object_: Any) -> T:
    return pydantic.v1.parse_obj_as(type_, object_)


def to_jsonable_with_fallback(obj: Any, fallback_serializer: Callable[[Any], Any]) -> Any:
    return fallback_serializer(obj)


class UniversalBaseModel(pydantic.v1.BaseModel):
    class Config:
        populate_by_name = True
        smart_union = True
        allow_population_by_field_name = True
        json_encoders = {dt.datetime: serialize_datetime}
        # Allow fields beginning with `model_` to be used in the model
        protected_namespaces = ()

    @pydantic.v1.root_validator(pre=True)
    def _parse_json_strings(cls, values: Any) -> Any:  # type: ignore[misc]
        """
        Parse JSON strings for fields that expect objects.
        """
        if not isinstance(values, Mapping):
            return values

        rewritten: Dict[str, Any] = dict(values)
        for key in rewritten:
            rewritten[key] = _maybe_parse_json_string(rewritten[key])

        return rewritten

    def json(self, **kwargs: Any) -> str:
        kwargs_with_defaults = {
            "by_alias": True,
            "exclude_unset": True,
            **kwargs,
        }
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: Any) -> Dict[str, Any]:
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

        fields = _get_model_fields(self.__class__)  # type: ignore[type-var]
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

        kwargs_with_defaults_exclude_unset_include_fields = {
            "by_alias": True,
            "exclude_unset": True,
            "include": _fields_set,
            **kwargs,
        }

        return super().dict(**kwargs_with_defaults_exclude_unset_include_fields)


UniversalRootModel: TypeAlias = UniversalBaseModel


def _union_list_of_pydantic_dicts(source: List[Any], destination: List[Any]) -> List[Any]:
    converted_list: List[Any] = []
    for i, item in enumerate(source):
        destination_value = destination[i]
        if isinstance(item, dict):
            converted_list.append(deep_union_pydantic_dicts(item, destination_value))
        elif isinstance(item, list):
            converted_list.append(_union_list_of_pydantic_dicts(item, destination_value))
        else:
            converted_list.append(item)
    return converted_list


def deep_union_pydantic_dicts(source: Dict[str, Any], destination: Dict[str, Any]) -> Dict[str, Any]:
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


def encode_by_type(o: Any) -> Any:
    encoders_by_class_tuples: Dict[Callable[[Any], Any], Tuple[Any, ...]] = defaultdict(tuple)
    for type_, encoder in encoders_by_type.items():
        encoders_by_class_tuples[encoder] += (type_,)

    if type(o) in encoders_by_type:
        return encoders_by_type[type(o)](o)
    for encoder, classes_tuple in encoders_by_class_tuples.items():
        if isinstance(o, classes_tuple):
            return encoder(o)


def update_forward_refs(model: Type["Model"], **localns: Any) -> None:
    model.update_forward_refs(**localns)


def universal_root_validator(pre: bool = False) -> Callable[[AnyCallable], AnyCallable]:
    def decorator(func: AnyCallable) -> AnyCallable:
        return cast(AnyCallable, pydantic.v1.root_validator(pre=pre)(func))

    return decorator


def universal_field_validator(field_name: str, pre: bool = False) -> Callable[[AnyCallable], AnyCallable]:
    def decorator(func: AnyCallable) -> AnyCallable:
        return cast(AnyCallable, pydantic.v1.validator(field_name, pre=pre)(func))

    return decorator


PydanticField = Union[ModelField, pydantic.fields.FieldInfo]


def _get_model_fields(model: Type["Model"]) -> Mapping[str, PydanticField]:
    return cast(Mapping[str, PydanticField], model.__fields__)


def _get_field_default(field: PydanticField) -> Any:
    try:
        value = field.get_default()  # type: ignore[union-attr]
    except:
        value = field.default
    return value
