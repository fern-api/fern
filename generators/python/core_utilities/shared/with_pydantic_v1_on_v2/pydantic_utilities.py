# nopycln: file
import datetime as dt
import inspect
import json
import logging
from collections import defaultdict
from dataclasses import asdict
from typing import Any, Callable, Dict, List, Mapping, Optional, Set, Tuple, Type, TypeVar, Union, cast

import pydantic
import typing_extensions
from .datetime_utils import serialize_datetime
from .http_sse._models import ServerSentEvent
from .serialization import convert_and_respect_annotation_metadata
from pydantic.datetime_parse import parse_date as parse_date
from pydantic.datetime_parse import parse_datetime as parse_datetime
from pydantic.fields import ModelField as ModelField  # type: ignore[attr-defined]
from pydantic.json import ENCODERS_BY_TYPE as encoders_by_type  # type: ignore[attr-defined]
from pydantic.typing import get_args as get_args
from pydantic.typing import get_origin as get_origin
from pydantic.typing import is_literal_type as is_literal_type
from pydantic.typing import is_union as is_union
from typing_extensions import TypeAlias

_logger = logging.getLogger(__name__)

T = TypeVar("T")
Model = TypeVar("Model", bound=pydantic.BaseModel)

_PYDANTIC_V1 = getattr(pydantic, "v1", pydantic)
_PYDANTIC_V1_BASE_MODEL = getattr(_PYDANTIC_V1, "BaseModel", pydantic.BaseModel)

PydanticField = Union[ModelField, pydantic.fields.FieldInfo]


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


def _get_field_annotation_v1(model: Type[Any], field_name: str) -> Optional[Type[Any]]:
    """Get the type annotation of a field from a Pydantic v1 model."""
    fields = getattr(model, "__fields__", {})
    field_info = fields.get(field_name)
    if field_info:
        return field_info.outer_type_
    return None


def _find_variant_by_discriminator(
    variants: List[Type[Any]],
    discriminator: str,
    discriminator_value: Any,
) -> Optional[Type[Any]]:
    """Find the union variant that matches the discriminator value."""
    for variant in variants:
        if not (inspect.isclass(variant) and issubclass(variant, _PYDANTIC_V1_BASE_MODEL)):
            continue

        disc_annotation = _get_field_annotation_v1(variant, discriminator)
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
            data_type = _get_field_annotation_v1(matching_variant, "data")
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
    # convert_and_respect_annotation_metadata is required for TypedDict aliasing.
    #
    # For Pydantic models (running under pydantic.v1), whether we should pre-dealias depends on how
    # the model encodes aliasing:
    # - If the model uses real Pydantic aliases (Field(alias=...)), pass wire keys through unchanged.
    # - If the model encodes aliasing only via FieldMetadata, pre-dealias before validation.
    if inspect.isclass(type_) and issubclass(type_, _PYDANTIC_V1_BASE_MODEL):
        has_pydantic_aliases = False
        for field in getattr(type_, "__fields__", {}).values():
            alias = getattr(field, "alias", None)
            name = getattr(field, "name", None)
            if alias is not None and name is not None and alias != name:
                has_pydantic_aliases = True
                break

        dealiased_object = (
            object_
            if has_pydantic_aliases
            else convert_and_respect_annotation_metadata(object_=object_, annotation=type_, direction="read")
        )
    else:
        dealiased_object = convert_and_respect_annotation_metadata(object_=object_, annotation=type_, direction="read")
    return pydantic.v1.parse_obj_as(type_, dealiased_object)


def to_jsonable_with_fallback(obj: Any, fallback_serializer: Callable[[Any], Any]) -> Any:
    return fallback_serializer(obj)


class UniversalBaseModel(pydantic.v1.BaseModel):
    class Config:
        smart_union = True
        json_encoders = {dt.datetime: serialize_datetime}

    @pydantic.v1.root_validator(pre=True)
    def _coerce_field_names_to_aliases(cls, values: Any) -> Any:  # type: ignore[misc]
        """
        Accept Python field names in input by rewriting them to their Pydantic aliases,
        while avoiding silent collisions when a key could refer to multiple fields.
        """
        if not isinstance(values, Mapping):
            return values

        fields = getattr(cls, "__fields__", {})
        name_to_alias: Dict[str, str] = {}
        alias_to_name: Dict[str, str] = {}

        for name, field in fields.items():
            alias = getattr(field, "alias", None) or name
            name_to_alias[name] = alias
            if alias != name:
                alias_to_name[alias] = name

        ambiguous_keys = set(alias_to_name.keys()).intersection(set(name_to_alias.keys()))
        for key in ambiguous_keys:
            if key in values and name_to_alias[key] not in values:
                raise ValueError(
                    f"Ambiguous input key '{key}': it is both a field name and an alias. "
                    "Provide the explicit alias key to disambiguate."
                )

        original_keys = set(values.keys())
        rewritten: Dict[str, Any] = dict(values)
        for name, alias in name_to_alias.items():
            if alias != name and name in original_keys and alias not in rewritten:
                rewritten[alias] = rewritten.pop(name)

        return rewritten

    @classmethod
    def model_construct(cls: Type["Model"], _fields_set: Optional[Set[str]] = None, **values: Any) -> "Model":  # type: ignore[misc]
        dealiased_object = convert_and_respect_annotation_metadata(object_=values, annotation=cls, direction="read")
        return cls.construct(_fields_set, **dealiased_object)

    @classmethod
    def construct(cls: Type["Model"], _fields_set: Optional[Set[str]] = None, **values: Any) -> "Model":  # type: ignore[misc]
        dealiased_object = convert_and_respect_annotation_metadata(object_=values, annotation=cls, direction="read")
        return super().construct(_fields_set, **dealiased_object)  # type: ignore[misc]

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

        dict_dump = super().dict(**kwargs_with_defaults_exclude_unset_include_fields)

        return convert_and_respect_annotation_metadata(object_=dict_dump, annotation=self.__class__, direction="write")


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


# Mirrors Pydantic's internal typing
AnyCallable = Callable[..., Any]


def universal_root_validator(pre: bool = False) -> Callable[[AnyCallable], AnyCallable]:
    def decorator(func: AnyCallable) -> AnyCallable:
        return cast(AnyCallable, pydantic.v1.root_validator(pre=pre)(func))

    return decorator


def universal_field_validator(field_name: str, pre: bool = False) -> Callable[[AnyCallable], AnyCallable]:
    def decorator(func: AnyCallable) -> AnyCallable:
        return cast(AnyCallable, pydantic.v1.validator(field_name, pre=pre)(func))

    return decorator


def _get_model_fields(model: Type["Model"]) -> Mapping[str, PydanticField]:
    return cast(Mapping[str, PydanticField], model.__fields__)


def _get_field_default(field: PydanticField) -> Any:
    try:
        value = field.get_default()  # type: ignore[union-attr]
    except:
        value = field.default
    return value
