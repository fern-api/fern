from __future__ import annotations

import inspect
from datetime import date, datetime
from functools import lru_cache
from typing import TYPE_CHECKING, Any, Mapping, Set, Type, TypeVar, Union, cast

import pydantic
import pydantic.generics
from pydantic.fields import FieldInfo
from pydantic_core import PydanticUndefined
from typing_extensions import Annotated, ClassVar, TypeAlias, override

from .datetime_utils import serialize_datetime
from .pydantic_utilities import (
    IS_PYDANTIC_V2,
    get_args,
    get_field_default,
    get_origin,
    is_literal_type,
    is_union,
    parse_date,
    parse_datetime,
)
from .serialization import get_field_to_alias_mapping
from .typing_utils import (
    extract_type_arg,
    is_annotated_type,
    is_list,
    is_mapping,
    is_type_alias_type,
)

_T = TypeVar("_T")
_BaseModelT = TypeVar("_BaseModelT", bound=pydantic.BaseModel)

# Note: copied from Pydantic
# https://github.com/pydantic/pydantic/blob/6f31f8f68ef011f84357330186f603ff295312fd/pydantic/main.py#L79
_IncEx: TypeAlias = Union[
    Set[int],
    Set[str],
    Mapping[int, Union["_IncEx", bool]],
    Mapping[str, Union["_IncEx", bool]],
]

# TODO: Move this to pydantic_utilities.py
if TYPE_CHECKING:

    class GenericModel(pydantic.BaseModel): ...

else:
    if IS_PYDANTIC_V2:

        class GenericModel(pydantic.BaseModel): ...

    else:
        import pydantic.generics

        class GenericModel(pydantic.generics.GenericModel, pydantic.BaseModel): ...


class UnionMetadata:
    discriminant: str

    def __init__(self, *, discriminant: str) -> None:
        self.discriminant = discriminant


class BaseModel(pydantic.BaseModel):
    if IS_PYDANTIC_V2:
        model_config: ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(
            extra="allow",
            frozen=True,
            protected_namespaces=(),
        )

        @pydantic.model_serializer(mode="wrap", when_used="json")  # type: ignore # Pydantic v2
        def serialize_model(self, handler: pydantic.SerializerFunctionWrapHandler) -> Any:  # type: ignore # Pydantic v2
            serialized = handler(self)
            data = {
                k: serialize_datetime(v) if isinstance(v, datetime) else v
                for k, v in serialized.items()
            }
            return data

    else:

        @property
        @override
        def model_fields_set(self) -> set[str]:
            # Included for pydantic v2 forward compatibility.
            return self.__fields_set__  # type: ignore

        class Config(pydantic.BaseConfig):  # pyright: ignore[reportDeprecated]
            extra: Any = pydantic.Extra.allow  # type: ignore
            frozen = True
            json_encoders = {datetime: serialize_datetime}
            smart_union = True
            protected_namespaces = ()

    def dict(self, **kwargs: Any) -> dict[str, Any]:
        """Generates the dictionary representation of the model."""
        return self.model_dump(
            by_alias=True,
            exclude_unset=True,
            exclude_none=False,
            **kwargs,
        )

    def json(self, **kwargs: Any) -> str:
        """Generates the JSON string representation of the model."""
        return self.model_dump_json(
            indent=2,
            by_alias=True,
            exclude_unset=True,
            **kwargs,
        )

    @override
    def __str__(self) -> str:
        # mypy complains about an invalid self arg
        return f"{self.__repr_name__()}({self.__repr_str__(', ')})"  # type: ignore[misc]

    # Override the 'construct' method to support parsing without validation.
    # Based on https://github.com/samuelcolvin/pydantic/issues/1168#issuecomment-817742836.
    @classmethod
    @override
    def construct(  # pyright: ignore[reportIncompatibleMethodOverride]
        __cls: Type[_BaseModelT],
        _fields_set: set[str] | None = None,
        **values: object,
    ) -> _BaseModelT:
        m = __cls.__new__(__cls)
        fields_values: dict[str, object] = {}

        if _fields_set is None:
            _fields_set = set(values.keys())

        fields = _get_model_fields(__cls)
        populate_by_name = _get_populate_by_name(__cls)
        field_aliases = get_field_to_alias_mapping(__cls)

        for name, field in fields.items():
            # Key here is only used to pull data from the values dict.
            # You should always use the NAME of the field for field_values because
            # that's how the object is constructed from a pydantic perspective.
            key = field.alias
            if (key is None or field.alias == name) and name in field_aliases:
                key = field_aliases[name]

            if key is None or (key not in values and populate_by_name):
                key = name

            if key in values:
                fields_values[name] = _construct_field(
                    value=values[key], field=field, key=key
                )
                _fields_set.add(name)
            else:
                default = get_field_default(field)
                fields_values[name] = default

                # If the default values are non-null act like they've been set.
                # This effectively allows exclude_unset to work like exclude_none where
                # the latter passes through intentionally set none values.
                if default != None and default != PydanticUndefined:
                    _fields_set.add(name)

        extras = {}
        pydantic_alias_fields = [field.alias for field in fields.values()]
        internal_alias_fields = list(field_aliases.values())
        for key, value in values.items():
            # If the key is not a field by name, nor an alias to a field, then it's extra.
            if (
                key not in pydantic_alias_fields and key not in internal_alias_fields
            ) and key not in fields:
                if IS_PYDANTIC_V2:
                    extras[key] = value
                else:
                    _fields_set.add(key)
                    fields_values[key] = value

        object.__setattr__(m, "__dict__", fields_values)

        if IS_PYDANTIC_V2:
            object.__setattr__(m, "__pydantic_private__", None)
            object.__setattr__(m, "__pydantic_extra__", extras)
            object.__setattr__(m, "__pydantic_fields_set__", _fields_set)
        else:
            object.__setattr__(m, "__fields_set__", _fields_set)
            m._init_private_attributes()  # type: ignore # Pydantic v1
        return m

    if not TYPE_CHECKING:
        model_construct = construct


def construct_type(*, object_: object, type_: object) -> object:
    """Loose coercion to the expected type with construction of nested values.

    If the given value does not match the expected type then it is returned as-is.
    """

    original_type = None
    type_ = cast("type[object]", type_)
    if is_type_alias_type(type_):
        original_type = type_  # type: ignore[unreachable]
        type_ = type_.__value__  # type: ignore[unreachable]

    if is_annotated_type(type_):
        meta: tuple[Any, ...] = get_args(type_)[1:]
        type_ = extract_type_arg(type_, 0)
    else:
        meta = tuple()

    origin = get_origin(type_) or type_
    args = get_args(type_)

    if is_union(origin):
        try:
            return _validate_type(
                type_=cast("type[object]", original_type or type_), value=object_
            )
        except Exception:
            pass

        return _convert_union_type(type_, object_)

    if origin == dict:
        if not is_mapping(object_):
            return object_

        _, items_type = get_args(type_)
        return {
            key: construct_type(object_=item, type_=items_type)
            for key, item in object_.items()
        }

    if (
        not is_literal_type(type_)
        and inspect.isclass(origin)
        and (issubclass(origin, BaseModel) or issubclass(origin, GenericModel))
    ):
        if is_list(object_):
            return [
                cast(Any, type_).construct(**entry) if is_mapping(entry) else entry
                for entry in object_
            ]

        if is_mapping(object_):
            if issubclass(type_, BaseModel):
                return type_.construct(**object_)  # type: ignore[arg-type]

            return cast(Any, type_).construct(**object_)

    if origin == list:
        if not is_list(object_):
            return object_

        inner_type = args[0]
        return [construct_type(object_=entry, type_=inner_type) for entry in object_]

    if origin == float:
        if isinstance(object_, int):
            coerced = float(object_)
            if coerced != object_:
                return object_
            return coerced

        return object_

    if type_ == datetime:
        try:
            return parse_datetime(object_)  # type: ignore
        except Exception:
            return object_

    if type_ == date:
        try:
            return parse_date(object_)  # type: ignore
        except Exception:
            return object_

    return object_


def _get_model_fields(model: type[pydantic.BaseModel]) -> dict[str, FieldInfo]:
    if IS_PYDANTIC_V2:
        return model.model_fields  # type: ignore
    return model.__fields__  # type: ignore


def _get_populate_by_name(model: type[pydantic.BaseModel]) -> bool:
    if IS_PYDANTIC_V2:
        return model.model_config.get("populate_by_name", False)  # type: ignore # Pydantic v2
    return model.__config__.allow_population_by_field_name  # type: ignore # Pydantic v1


def _construct_field(value: object, field: FieldInfo, key: str) -> object:
    if value is None:
        return get_field_default(field)

    if IS_PYDANTIC_V2:
        type_ = field.annotation
    else:
        type_ = cast(type, field.outer_type_)  # type: ignore

    if type_ is None:
        raise RuntimeError(f"Unexpected field type is None for {key}")

    return construct_type(object_=value, type_=type_)


def _parse_obj(model: type[_BaseModelT], value: object) -> _BaseModelT:
    if IS_PYDANTIC_V2:
        return model.model_validate(value)
    else:
        return cast(
            _BaseModelT, model.parse_obj(value)
        )  # pyright: ignore[reportDeprecated, reportUnnecessaryCast]


def _validate_type(*, type_: type[_T], value: object) -> _T:
    """Strict validation that the given value matches the expected type"""
    if inspect.isclass(type_) and issubclass(type_, pydantic.BaseModel):
        return cast(_T, _parse_obj(type_, value))

    return cast(_T, _validate_non_model_type(type_=type_, value=value))


def _convert_union_type(type_: type[Any], value: Any) -> Any:
    base_type = get_origin(type_) or type_
    union_type = type_
    if base_type == Annotated:
        union_type = get_args(type_)[0]
        annotated_metadata = get_args(type_)[1:]
        for metadata in annotated_metadata:
            if isinstance(metadata, UnionMetadata):
                try:
                    # Cast to the correct type, based on the discriminant
                    for inner_type in get_args(union_type):
                        try:
                            objects_discriminant = getattr(value, metadata.discriminant)
                        except:
                            objects_discriminant = value[metadata.discriminant]
                        if (
                            inner_type.__fields__[metadata.discriminant].default
                            == objects_discriminant
                        ):
                            return construct_type(object_=value, type_=inner_type)
                except Exception:
                    # Allow to fall through to our regular union handling
                    pass
    return _convert_undiscriminated_union_type(union_type, value)


def _convert_undiscriminated_union_type(union_type: type[Any], value: Any) -> Any:
    inner_types = get_args(union_type)
    if Any in inner_types:
        return value

    for inner_type in inner_types:
        try:
            if inspect.isclass(inner_type) and issubclass(
                inner_type, pydantic.BaseModel
            ):
                return _parse_obj(inner_type, value)
        except Exception:
            continue

    # If none of the types were parsed, just return the first successful match.
    for inner_type in inner_types:
        try:
            return construct_type(object_=value, type_=inner_type)
        except Exception:
            continue


# TODO: Move this to pydantic_utilities.py
if IS_PYDANTIC_V2:
    from pydantic import TypeAdapter as _TypeAdapter

    _CachedTypeAdapter = cast(
        "TypeAdapter[object]", lru_cache(maxsize=None)(_TypeAdapter)
    )

    if TYPE_CHECKING:
        from pydantic import TypeAdapter
    else:
        TypeAdapter = _CachedTypeAdapter

    def _validate_non_model_type(*, type_: type[_T], value: object) -> _T:
        return TypeAdapter(type_).validate_python(value)

elif not TYPE_CHECKING:

    class RootModel(GenericModel, Generic[_T]):
        __root__: _T

    def _validate_non_model_type(*, type_: type[_T], value: object) -> _T:
        model = RootModel[type_].validate(value)
        return cast(_T, model.__root__)
