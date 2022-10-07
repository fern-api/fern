import typing

import pydantic
import typing_extensions

from ..commons.wire_string_with_all_casings import WireStringWithAllCasings
from ..commons.with_docs import WithDocs
from .single_union_type_properties import SingleUnionTypeProperties
from .type_reference import TypeReference


class SingleUnionType(WithDocs):
    discriminant_value: WireStringWithAllCasings = pydantic.Field(alias="discriminantValue")
    value_type: TypeReference = pydantic.Field(alias="valueType")
    shape: SingleUnionTypeProperties

    @pydantic.validator("discriminant_value")
    def _validate_discriminant_value(cls, discriminant_value: WireStringWithAllCasings) -> WireStringWithAllCasings:
        for validator in SingleUnionType.Validators._discriminant_value:
            discriminant_value = validator(discriminant_value)
        return discriminant_value

    @pydantic.validator("value_type")
    def _validate_value_type(cls, value_type: TypeReference) -> TypeReference:
        for validator in SingleUnionType.Validators._value_type:
            value_type = validator(value_type)
        return value_type

    @pydantic.validator("shape")
    def _validate_shape(cls, shape: SingleUnionTypeProperties) -> SingleUnionTypeProperties:
        for validator in SingleUnionType.Validators._shape:
            shape = validator(shape)
        return shape

    class Validators:
        _discriminant_value: typing.ClassVar[
            typing.List[typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings]]
        ] = []
        _value_type: typing.ClassVar[typing.List[typing.Callable[[TypeReference], TypeReference]]] = []
        _shape: typing.ClassVar[
            typing.List[typing.Callable[[SingleUnionTypeProperties], SingleUnionTypeProperties]]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["discriminant_value"]
        ) -> typing.Callable[
            [typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings]],
            typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["value_type"]
        ) -> typing.Callable[
            [typing.Callable[[TypeReference], TypeReference]], typing.Callable[[TypeReference], TypeReference]
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["shape"]
        ) -> typing.Callable[
            [typing.Callable[[SingleUnionTypeProperties], SingleUnionTypeProperties]],
            typing.Callable[[SingleUnionTypeProperties], SingleUnionTypeProperties],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "discriminant_value":
                    cls._discriminant_value.append(validator)
                elif field_name == "value_type":
                    cls._value_type.append(validator)
                elif field_name == "shape":
                    cls._shape.append(validator)
                else:
                    raise RuntimeError("Field does not exist on SingleUnionType: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
