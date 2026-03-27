# nopycln: file
import datetime as dt
import json
import logging
from collections import defaultdict
from typing import (
    TYPE_CHECKING,
    Any,
    Callable,
    ClassVar,
    Dict,
    List,
    Mapping,
    Optional,
    Tuple,
    Type,
    TypeVar,
    Union,
    cast,
)

import pydantic
import typing_extensions
from pydantic.fields import FieldInfo as _FieldInfo

_logger = logging.getLogger(__name__)

if TYPE_CHECKING:
    from .http_sse._models import ServerSentEvent

IS_PYDANTIC_V2 = pydantic.VERSION.startswith("2.")

if IS_PYDANTIC_V2:
    _datetime_adapter = pydantic.TypeAdapter(dt.datetime)  # type: ignore[attr-defined]
    _date_adapter = pydantic.TypeAdapter(dt.date)  # type: ignore[attr-defined]

    def parse_datetime(value: Any) -> dt.datetime:  # type: ignore[misc]
        if isinstance(value, dt.datetime):
            return value
        return _datetime_adapter.validate_python(value)

    def parse_date(value: Any) -> dt.date:  # type: ignore[misc]
        if isinstance(value, dt.datetime):
            return value.date()
        if isinstance(value, dt.date):
            return value
        return _date_adapter.validate_python(value)

    # Avoid importing from pydantic.v1 to maintain Python 3.14 compatibility.
    from typing import get_args as get_args  # type: ignore[assignment]
    from typing import get_origin as get_origin  # type: ignore[assignment]

    def is_literal_type(tp: Optional[Type[Any]]) -> bool:  # type: ignore[misc]
        return typing_extensions.get_origin(tp) is typing_extensions.Literal

    def is_union(tp: Optional[Type[Any]]) -> bool:  # type: ignore[misc]
        return tp is Union or typing_extensions.get_origin(tp) is Union  # type: ignore[comparison-overlap]

    # Inline encoders_by_type to avoid importing from pydantic.v1.json
    import re as _re
    from collections import deque as _deque
    from decimal import Decimal as _Decimal
    from enum import Enum as _Enum
    from ipaddress import (
        IPv4Address as _IPv4Address,
    )
    from ipaddress import (
        IPv4Interface as _IPv4Interface,
    )
    from ipaddress import (
        IPv4Network as _IPv4Network,
    )
    from ipaddress import (
        IPv6Address as _IPv6Address,
    )
    from ipaddress import (
        IPv6Interface as _IPv6Interface,
    )
    from ipaddress import (
        IPv6Network as _IPv6Network,
    )
    from pathlib import Path as _Path
    from types import GeneratorType as _GeneratorType
    from uuid import UUID as _UUID

    from pydantic.fields import FieldInfo as ModelField  # type: ignore[no-redef, assignment]

    def _decimal_encoder(dec_value: Any) -> Any:
        if dec_value.as_tuple().exponent >= 0:
            return int(dec_value)
        return float(dec_value)

    encoders_by_type: Dict[Type[Any], Callable[[Any], Any]] = {  # type: ignore[no-redef]
        bytes: lambda o: o.decode(),
        dt.date: lambda o: o.isoformat(),
        dt.datetime: lambda o: o.isoformat(),
        dt.time: lambda o: o.isoformat(),
        dt.timedelta: lambda td: td.total_seconds(),
        _Decimal: _decimal_encoder,
        _Enum: lambda o: o.value,
        frozenset: list,
        _deque: list,
        _GeneratorType: list,
        _IPv4Address: str,
        _IPv4Interface: str,
        _IPv4Network: str,
        _IPv6Address: str,
        _IPv6Interface: str,
        _IPv6Network: str,
        _Path: str,
        _re.Pattern: lambda o: o.pattern,
        set: list,
        _UUID: str,
    }
else:
    from pydantic.datetime_parse import parse_date as parse_date  # type: ignore[no-redef]
    from pydantic.datetime_parse import parse_datetime as parse_datetime  # type: ignore[no-redef]
    from pydantic.fields import ModelField as ModelField  # type: ignore[attr-defined, no-redef, assignment]
    from pydantic.json import ENCODERS_BY_TYPE as encoders_by_type  # type: ignore[no-redef]
    from pydantic.typing import get_args as get_args  # type: ignore[no-redef]
    from pydantic.typing import get_origin as get_origin  # type: ignore[no-redef]
    from pydantic.typing import is_literal_type as is_literal_type  # type: ignore[no-redef, assignment]
    from pydantic.typing import is_union as is_union  # type: ignore[no-redef]

from .datetime_utils import serialize_datetime
from typing_extensions import TypeAlias

T = TypeVar("T")
Model = TypeVar("Model", bound=pydantic.BaseModel)


def parse_sse_data(sse: "ServerSentEvent", type_: Type[T]) -> T:
    """
    Parse an SSE event where the discriminant is inside the data payload (data-level discrimination).

    The sse.data field contains JSON with the discriminant and all payload fields flattened together.
    Example: sse.data = '{"event": "entity", "entityId": "123", "eventType": "CREATED"}'

    Args:
        sse: The ServerSentEvent object to parse
        type_: The target discriminated union type

    Returns:
        The parsed object of type T
    """
    data = json.loads(sse.data)
    return parse_obj_as(type_, data)


def parse_sse_protocol(sse: "ServerSentEvent", type_: Type[T]) -> T:
    """
    Parse an SSE event where the discriminant is at the protocol level (protocol-level discrimination).

    The discriminant comes from the SSE event field (sse.event), not from inside sse.data.
    The data field can be any type: absent, string, number, or JSON object.
    Example: SSE with event: "object_data", data: '{"message": "hello", "timestamp": "..."}'

    Args:
        sse: The ServerSentEvent object to parse
        type_: The target discriminated union type

    Returns:
        The parsed object of type T
    """
    _PARSE_FAILED = object()
    envelope: Dict[str, Any] = {"event": sse.event}
    if sse.data is not None:
        try:
            parsed_data: Any = json.loads(sse.data)
        except (json.JSONDecodeError, ValueError):
            parsed_data = _PARSE_FAILED

        if parsed_data is not _PARSE_FAILED:
            envelope["data"] = parsed_data
            try:
                return parse_obj_as(type_, envelope)
            except Exception:
                # If validation fails with JSON-parsed data (e.g. variant expects str
                # but data was valid JSON like '{"status": "processing"}'), fall back
                # to the raw string so string-typed variants work correctly.
                envelope["data"] = sse.data
        else:
            envelope["data"] = sse.data
    return parse_obj_as(type_, envelope)


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
    if IS_PYDANTIC_V2:
        model_config: ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(  # type: ignore[typeddict-unknown-key]
            validate_by_name=True,
            validate_by_alias=True,
            # Allow fields beginning with `model_` to be used in the model
            protected_namespaces=(),
        )

        @pydantic.model_serializer(mode="plain", when_used="json")  # type: ignore[attr-defined]
        def serialize_model(self) -> Any:  # type: ignore[name-defined]
            def _serialize_recursive(obj: Any) -> Any:
                if isinstance(obj, dt.datetime):
                    return serialize_datetime(obj)
                elif isinstance(obj, dict):
                    return {k: _serialize_recursive(v) for k, v in obj.items()}
                elif isinstance(obj, list):
                    return [_serialize_recursive(item) for item in obj]
                return obj

            serialized = self.model_dump()  # type: ignore[attr-defined]
            return _serialize_recursive(serialized)

    else:

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


PydanticField = Union[ModelField, _FieldInfo]


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
