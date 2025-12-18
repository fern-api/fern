# nopycln: file
import datetime as dt
from collections import defaultdict
from typing import Any, Callable, Dict, List, Mapping, Optional, Set, Tuple, Type, TypeVar, Union, cast

import pydantic

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


def copy_and_update_model(
    source: pydantic.BaseModel,
    target_cls: Type[Model],
    *,
    update: Optional[Dict[str, Any]] = None,
    exclude: Optional[Set[str]] = None,
) -> Model:
    """
    Efficiently copy fields from a source model to a new instance of target_cls
    without deep serialization (avoiding .dict() overhead).

    This is useful for union type conversions where we need to:
    - Add fields (e.g., discriminant field in factory methods)
    - Remove fields (e.g., discriminant field in visit methods)

    Args:
        source: The source Pydantic model instance
        target_cls: The target model class to create
        update: Optional dict of field values to add/override
        exclude: Optional set of field names to exclude from copying

    Returns:
        A new instance of target_cls with copied fields
    """
    update = update or {}
    exclude = exclude or set()

    if IS_PYDANTIC_V2:
        fields_set = source.__pydantic_fields_set__.copy()  # type: ignore[attr-defined]
        extras = getattr(source, "__pydantic_extra__", None) or {}
    else:
        fields_set = source.__fields_set__.copy()
        extras = {}
        for key in source.__dict__:
            if key not in source.__fields__:
                extras[key] = source.__dict__[key]

    values: Dict[str, Any] = {}
    for field_name in source.__dict__:
        if field_name not in exclude:
            values[field_name] = source.__dict__[field_name]

    for key in extras:
        if key not in exclude:
            values[key] = extras[key]

    for key, value in update.items():
        values[key] = value
        fields_set.add(key)

    for field_name in exclude:
        fields_set.discard(field_name)

    if IS_PYDANTIC_V2:
        return cast(
            Model,
            pydantic.BaseModel.model_construct.__func__(target_cls, fields_set, **values),  # type: ignore[attr-defined]
        )
    else:
        return cast(
            Model,
            pydantic.BaseModel.construct.__func__(target_cls, fields_set, **values),  # type: ignore[attr-defined]
        )
