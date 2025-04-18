import datetime as dt
import inspect
import typing
import uuid

import pydantic
import typing_extensions
from .pydantic_utilities import (
    IS_PYDANTIC_V2,
    ModelField,
    UniversalBaseModel,
    get_args,
    get_origin,
    is_literal_type,
    is_union,
    parse_date,
    parse_datetime,
    parse_obj_as,
)
from .serialization import get_field_to_alias_mapping
from pydantic_core import PydanticUndefined


class UnionMetadata:
    discriminant: str

    def __init__(self, *, discriminant: str) -> None:
        self.discriminant = discriminant


Model = typing.TypeVar("Model", bound=pydantic.BaseModel)


class UncheckedBaseModel(UniversalBaseModel):
    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="allow")  # type: ignore # Pydantic v2
    else:

        class Config:
            extra = pydantic.Extra.allow

    @classmethod
    def model_construct(
        cls: typing.Type["Model"],
        _fields_set: typing.Optional[typing.Set[str]] = None,
        **values: typing.Any,
    ) -> "Model":
        # Fallback construct function to the specified override below.
        return cls.construct(_fields_set=_fields_set, **values)

    # Allow construct to not validate model
    # Implementation taken from: https://github.com/pydantic/pydantic/issues/1168#issuecomment-817742836
    @classmethod
    def construct(
        cls: typing.Type["Model"],
        _fields_set: typing.Optional[typing.Set[str]] = None,
        **values: typing.Any,
    ) -> "Model":
        m = cls.__new__(cls)
        fields_values = {}

        if _fields_set is None:
            _fields_set = set(values.keys())

        fields = _get_model_fields(cls)
        populate_by_name = _get_is_populate_by_name(cls)
        field_aliases = get_field_to_alias_mapping(cls)

        for name, field in fields.items():
            # Key here is only used to pull data from the values dict
            # you should always use the NAME of the field to for field_values, etc.
            # because that's how the object is constructed from a pydantic perspective
            key = field.alias
            if (key is None or field.alias == name) and name in field_aliases:
                key = field_aliases[name]

            if key is None or (key not in values and populate_by_name):  # Added this to allow population by field name
                key = name

            if key in values:
                if IS_PYDANTIC_V2:
                    type_ = field.annotation  # type: ignore # Pydantic v2
                else:
                    type_ = typing.cast(typing.Type, field.outer_type_)  # type: ignore # Pydantic < v1.10.15

                fields_values[name] = (
                    construct_type(object_=values[key], type_=type_) if type_ is not None else values[key]
                )
                _fields_set.add(name)
            else:
                default = _get_field_default(field)
                fields_values[name] = default

                # If the default values are non-null act like they've been set
                # This effectively allows exclude_unset to work like exclude_none where
                # the latter passes through intentionally set none values.
                if default != None and default != PydanticUndefined:
                    _fields_set.add(name)

        # Add extras back in
        extras = {}
        pydantic_alias_fields = [field.alias for field in fields.values()]
        internal_alias_fields = list(field_aliases.values())
        for key, value in values.items():
            # If the key is not a field by name, nor an alias to a field, then it's extra
            if (key not in pydantic_alias_fields and key not in internal_alias_fields) and key not in fields:
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


def _convert_undiscriminated_union_type(union_type: typing.Type[typing.Any], object_: typing.Any) -> typing.Any:
    inner_types = get_args(union_type)
    if typing.Any in inner_types:
        return object_

    for inner_type in inner_types:
        try:
            if inspect.isclass(inner_type) and issubclass(inner_type, pydantic.BaseModel):
                # Attempt a validated parse until one works
                return parse_obj_as(inner_type, object_)
        except Exception:
            continue

    # If none of the types work, just return the first successful cast
    for inner_type in inner_types:
        try:
            return construct_type(object_=object_, type_=inner_type)
        except Exception:
            continue


def _convert_union_type(type_: typing.Type[typing.Any], object_: typing.Any) -> typing.Any:
    base_type = get_origin(type_) or type_
    union_type = type_
    if base_type == typing_extensions.Annotated:
        union_type = get_args(type_)[0]
        annotated_metadata = get_args(type_)[1:]
        for metadata in annotated_metadata:
            if isinstance(metadata, UnionMetadata):
                try:
                    # Cast to the correct type, based on the discriminant
                    for inner_type in get_args(union_type):
                        try:
                            objects_discriminant = getattr(object_, metadata.discriminant)
                        except:
                            objects_discriminant = object_[metadata.discriminant]
                        if inner_type.__fields__[metadata.discriminant].default == objects_discriminant:
                            return construct_type(object_=object_, type_=inner_type)
                except Exception:
                    # Allow to fall through to our regular union handling
                    pass
    return _convert_undiscriminated_union_type(union_type, object_)


def construct_type(*, type_: typing.Type[typing.Any], object_: typing.Any) -> typing.Any:
    """
    Here we are essentially creating the same `construct` method in spirit as the above, but for all types, not just
    Pydantic models.
    The idea is to essentially attempt to coerce object_ to type_ (recursively)
    """
    # Short circuit when dealing with optionals, don't try to coerces None to a type
    if object_ is None:
        return None

    base_type = get_origin(type_) or type_
    is_annotated = base_type == typing_extensions.Annotated
    maybe_annotation_members = get_args(type_)
    is_annotated_union = is_annotated and is_union(get_origin(maybe_annotation_members[0]))

    if base_type == typing.Any:
        return object_

    if base_type == dict:
        if not isinstance(object_, typing.Mapping):
            return object_

        key_type, items_type = get_args(type_)
        d = {
            construct_type(object_=key, type_=key_type): construct_type(object_=item, type_=items_type)
            for key, item in object_.items()
        }
        return d

    if base_type == list:
        if not isinstance(object_, list):
            return object_

        inner_type = get_args(type_)[0]
        return [construct_type(object_=entry, type_=inner_type) for entry in object_]

    if base_type == set:
        if not isinstance(object_, set) and not isinstance(object_, list):
            return object_

        inner_type = get_args(type_)[0]
        return {construct_type(object_=entry, type_=inner_type) for entry in object_}

    if is_union(base_type) or is_annotated_union:
        return _convert_union_type(type_, object_)

    # Cannot do an `issubclass` with a literal type, let's also just confirm we have a class before this call
    if (
        object_ is not None
        and not is_literal_type(type_)
        and (
            (inspect.isclass(base_type) and issubclass(base_type, pydantic.BaseModel))
            or (
                is_annotated
                and inspect.isclass(maybe_annotation_members[0])
                and issubclass(maybe_annotation_members[0], pydantic.BaseModel)
            )
        )
    ):
        if IS_PYDANTIC_V2:
            return type_.model_construct(**object_)
        else:
            return type_.construct(**object_)

    if base_type == dt.datetime:
        try:
            return parse_datetime(object_)
        except Exception:
            return object_

    if base_type == dt.date:
        try:
            return parse_date(object_)
        except Exception:
            return object_

    if base_type == uuid.UUID:
        try:
            return uuid.UUID(object_)
        except Exception:
            return object_

    if base_type == int:
        try:
            return int(object_)
        except Exception:
            return object_

    if base_type == bool:
        try:
            if isinstance(object_, str):
                stringified_object = object_.lower()
                return stringified_object == "true" or stringified_object == "1"

            return bool(object_)
        except Exception:
            return object_

    return object_


def _get_is_populate_by_name(model: typing.Type["Model"]) -> bool:
    if IS_PYDANTIC_V2:
        return model.model_config.get("populate_by_name", False)  # type: ignore # Pydantic v2
    return model.__config__.allow_population_by_field_name  # type: ignore # Pydantic v1


PydanticField = typing.Union[ModelField, pydantic.fields.FieldInfo]


# Pydantic V1 swapped the typing of __fields__'s values from ModelField to FieldInfo
# And so we try to handle both V1 cases, as well as V2 (FieldInfo from model.model_fields)
def _get_model_fields(
    model: typing.Type["Model"],
) -> typing.Mapping[str, PydanticField]:
    if IS_PYDANTIC_V2:
        return model.model_fields  # type: ignore # Pydantic v2
    else:
        return model.__fields__  # type: ignore # Pydantic v1


def _get_field_default(field: PydanticField) -> typing.Any:
    try:
        value = field.get_default()  # type: ignore # Pydantic < v1.10.15
    except:
        value = field.default
    if IS_PYDANTIC_V2:
        from pydantic_core import PydanticUndefined

        if value == PydanticUndefined:
            return None
        return value
    return value
