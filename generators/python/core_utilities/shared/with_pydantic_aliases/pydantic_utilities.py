# nopycln: file
import datetime as dt
import inspect
import json
import logging
from collections import defaultdict
from dataclasses import asdict
from typing import Any, Callable, Dict, List, Mapping, Optional, Tuple, Type, TypeVar, Union, cast

import pydantic
import typing_extensions
from .http_sse._models import ServerSentEvent

_logger = logging.getLogger(__name__)

IS_PYDANTIC_V2 = pydantic.VERSION.startswith("2.")

if IS_PYDANTIC_V2:
    from pydantic.v1.datetime_parse import parse_date as parse_date
    from pydantic.v1.datetime_parse import parse_datetime as parse_datetime
    from pydantic.v1.fields import ModelField as ModelField
    from pydantic.v1.json import ENCODERS_BY_TYPE as encoders_by_type  # type: ignore[attr-defined]
    from pydantic.v1.typing import get_args as get_args
    from pydantic.v1.typing import get_origin as get_origin
    from pydantic.v1.typing import is_literal_type as is_literal_type
    from pydantic.v1.typing import is_union as is_union
else:
    from pydantic.datetime_parse import parse_date as parse_date  # type: ignore[no-redef]
    from pydantic.datetime_parse import parse_datetime as parse_datetime  # type: ignore[no-redef]
    from pydantic.fields import ModelField as ModelField  # type: ignore[attr-defined, no-redef]
    from pydantic.json import ENCODERS_BY_TYPE as encoders_by_type  # type: ignore[no-redef]
    from pydantic.typing import get_args as get_args  # type: ignore[no-redef]
    from pydantic.typing import get_origin as get_origin  # type: ignore[no-redef]
    from pydantic.typing import is_literal_type as is_literal_type  # type: ignore[no-redef]
    from pydantic.typing import is_union as is_union  # type: ignore[no-redef]

from .datetime_utils import serialize_datetime
from typing_extensions import TypeAlias

T = TypeVar("T")
Model = TypeVar("Model", bound=pydantic.BaseModel)


def _get_discriminator_and_variants(type_: Type[Any]) -> Tuple[Optional[str], Optional[List[Type[Any]]]]:
    """
    Extract the discriminator field name and union variants from a discriminated union type.
    Supports Annotated[Union[...], Field(discriminator=...)] patterns.
    Returns (discriminator, variants) or (None, None) if not a discriminated union.
    """
    origin = typing_extensions.get_origin(type_)

    if origin is typing_extensions.Annotated:
        args = typing_extensions.get_args(type_)
        if len(args) >= 2:
            inner_type = args[0]
            # Check annotations for discriminator
            discriminator = None
            for annotation in args[1:]:
                if hasattr(annotation, "discriminator"):
                    discriminator = getattr(annotation, "discriminator", None)
                    break

            if discriminator:
                inner_origin = typing_extensions.get_origin(inner_type)
                if inner_origin is Union:
                    variants = list(typing_extensions.get_args(inner_type))
                    return discriminator, variants
    return None, None


def _get_field_annotation(model: Type[Any], field_name: str) -> Optional[Type[Any]]:
    """Get the type annotation of a field from a Pydantic model."""
    if IS_PYDANTIC_V2:
        fields = getattr(model, "model_fields", {})
        field_info = fields.get(field_name)
        if field_info:
            return cast(Optional[Type[Any]], field_info.annotation)
    else:
        fields = getattr(model, "__fields__", {})
        field_info = fields.get(field_name)
        if field_info:
            return cast(Optional[Type[Any]], field_info.outer_type_)
    return None


def _find_variant_by_discriminator(
    variants: List[Type[Any]],
    discriminator: str,
    discriminator_value: Any,
) -> Optional[Type[Any]]:
    """Find the union variant that matches the discriminator value."""
    for variant in variants:
        if not (inspect.isclass(variant) and issubclass(variant, pydantic.BaseModel)):
            continue

        disc_annotation = _get_field_annotation(variant, discriminator)
        if disc_annotation and is_literal_type(disc_annotation):
            literal_args = get_args(disc_annotation)
            if literal_args and literal_args[0] == discriminator_value:
                return variant
    return None


def _is_string_type(type_: Type[Any]) -> bool:
    """Check if a type is str or Optional[str]."""
    if type_ is str:
        return True

    origin = typing_extensions.get_origin(type_)
    if origin is Union:
        args = typing_extensions.get_args(type_)
        # Optional[str] = Union[str, None]
        non_none_args = [a for a in args if a is not type(None)]
        if len(non_none_args) == 1 and non_none_args[0] is str:
            return True

    return False


def parse_sse_obj(sse: ServerSentEvent, type_: Type[T]) -> T:
    """
    Parse a ServerSentEvent into the appropriate type.

    Handles two scenarios based on where the discriminator field is located:

    1. Data-level discrimination: The discriminator (e.g., 'type') is inside the 'data' payload.
       The union describes the data content, not the SSE envelope.
       -> Returns: json.loads(data) parsed into the type

    2. Event-level discrimination: The discriminator (e.g., 'event') is at the SSE event level.
       The union describes the full SSE event structure.
       -> Returns: SSE envelope with 'data' field JSON-parsed only if the variant expects non-string

    Args:
        sse: The ServerSentEvent object to parse
        type_: The target discriminated union type

    Returns:
        The parsed object of type T
    """
    sse_event = asdict(sse)
    discriminator, variants = _get_discriminator_and_variants(type_)

    if discriminator is None or variants is None:
        # Not a discriminated union - just parse normally
        return parse_obj_as(type_, sse_event)

    data_value = sse_event.get("data")

    # Check if discriminator is at the top level (event-level discrimination)
    if discriminator in sse_event:
        # Case 2: Event-level discrimination
        # Find the matching variant to check if 'data' field needs JSON parsing
        disc_value = sse_event.get(discriminator)
        matching_variant = _find_variant_by_discriminator(variants, discriminator, disc_value)

        if matching_variant is not None:
            # Check what type the variant expects for 'data'
            data_type = _get_field_annotation(matching_variant, "data")
            if data_type is not None and not _is_string_type(data_type):
                # Variant expects non-string data - parse JSON
                if isinstance(data_value, str) and data_value:
                    try:
                        parsed_data = json.loads(data_value)
                        new_object = dict(sse_event)
                        new_object["data"] = parsed_data
                        return parse_obj_as(type_, new_object)
                    except json.JSONDecodeError as e:
                        _logger.warning(
                            "Failed to parse SSE data field as JSON for event-level discrimination: %s, data: %s",
                            e,
                            data_value[:100] if len(data_value) > 100 else data_value,
                        )
        # Either no matching variant, data is string type, or JSON parse failed
        return parse_obj_as(type_, sse_event)

    else:
        # Case 1: Data-level discrimination
        # The discriminator is inside the data payload - extract and parse data only
        if isinstance(data_value, str) and data_value:
            try:
                parsed_data = json.loads(data_value)
                return parse_obj_as(type_, parsed_data)
            except json.JSONDecodeError as e:
                _logger.warning(
                    "Failed to parse SSE data field as JSON for data-level discrimination: %s, data: %s",
                    e,
                    data_value[:100] if len(data_value) > 100 else data_value,
                )
        return parse_obj_as(type_, sse_event)


def parse_obj_as(type_: Type[T], object_: Any) -> T:
    if IS_PYDANTIC_V2:
        adapter = pydantic.TypeAdapter(type_)  # type: ignore[attr-defined]
        return adapter.validate_python(object_)
    return pydantic.parse_obj_as(type_, object_)


def to_jsonable_with_fallback(obj: Any, fallback_serializer: Callable[[Any], Any]) -> Any:
    if IS_PYDANTIC_V2:
        from pydantic_core import to_jsonable_python

        return to_jsonable_python(obj, fallback=fallback_serializer)
    return fallback_serializer(obj)


class UniversalBaseModel(pydantic.BaseModel):
    class Config:
        populate_by_name = True
        smart_union = True
        allow_population_by_field_name = True
        json_encoders = {dt.datetime: serialize_datetime}
        # Allow fields beginning with `model_` to be used in the model
        protected_namespaces = ()

    def json(self, **kwargs: Any) -> str:
        kwargs_with_defaults = {
            "by_alias": True,
            "exclude_unset": True,
            **kwargs,
        }
        if IS_PYDANTIC_V2:
            return super().model_dump_json(**kwargs_with_defaults)  # type: ignore[misc]
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
        if IS_PYDANTIC_V2:
            kwargs_with_defaults_exclude_unset = {
                **kwargs,
                "by_alias": True,
                "exclude_unset": True,
                "exclude_none": False,
            }
            kwargs_with_defaults_exclude_none = {
                **kwargs,
                "by_alias": True,
                "exclude_none": True,
                "exclude_unset": False,
            }
            return deep_union_pydantic_dicts(
                super().model_dump(**kwargs_with_defaults_exclude_unset),  # type: ignore[misc]
                super().model_dump(**kwargs_with_defaults_exclude_none),  # type: ignore[misc]
            )

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

        kwargs_with_defaults_exclude_unset_include_fields = {
            "by_alias": True,
            "exclude_unset": True,
            "include": _fields_set,
            **kwargs,
        }

        return super().dict(**kwargs_with_defaults_exclude_unset_include_fields)


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


if IS_PYDANTIC_V2:

    class V2RootModel(UniversalBaseModel, pydantic.RootModel):  # type: ignore[name-defined, type-arg]
        pass

    UniversalRootModel: TypeAlias = V2RootModel
else:
    UniversalRootModel: TypeAlias = UniversalBaseModel  # type: ignore[misc, no-redef]


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
    if IS_PYDANTIC_V2:
        model.model_rebuild(raise_errors=False)  # type: ignore[attr-defined]
    else:
        model.update_forward_refs(**localns)


# Mirrors Pydantic's internal typing
AnyCallable = Callable[..., Any]


def universal_root_validator(
    pre: bool = False,
) -> Callable[[AnyCallable], AnyCallable]:
    def decorator(func: AnyCallable) -> AnyCallable:
        if IS_PYDANTIC_V2:
            # In Pydantic v2, for RootModel we always use "before" mode
            # The custom validators transform the input value before the model is created
            return cast(AnyCallable, pydantic.model_validator(mode="before")(func))  # type: ignore[attr-defined]
        return cast(AnyCallable, pydantic.root_validator(pre=pre)(func))  # type: ignore[call-overload]

    return decorator


def universal_field_validator(field_name: str, pre: bool = False) -> Callable[[AnyCallable], AnyCallable]:
    def decorator(func: AnyCallable) -> AnyCallable:
        if IS_PYDANTIC_V2:
            return cast(AnyCallable, pydantic.field_validator(field_name, mode="before" if pre else "after")(func))  # type: ignore[attr-defined]
        return cast(AnyCallable, pydantic.validator(field_name, pre=pre)(func))

    return decorator


PydanticField = Union[ModelField, pydantic.fields.FieldInfo]


def _get_model_fields(model: Type["Model"]) -> Mapping[str, PydanticField]:
    if IS_PYDANTIC_V2:
        return cast(Mapping[str, PydanticField], model.model_fields)  # type: ignore[attr-defined]
    return cast(Mapping[str, PydanticField], model.__fields__)


def _get_field_default(field: PydanticField) -> Any:
    try:
        value = field.get_default()  # type: ignore[union-attr]
    except:
        value = field.default
    if IS_PYDANTIC_V2:
        from pydantic_core import PydanticUndefined

        if value == PydanticUndefined:
            return None
        return value
    return value
