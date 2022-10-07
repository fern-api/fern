from __future__ import annotations

import typing

import pydantic
import typing_extensions


class MapType(pydantic.BaseModel):
    key_type: VariableType = pydantic.Field(alias="keyType")
    value_type: VariableType = pydantic.Field(alias="valueType")

    @pydantic.validator("key_type")
    def _validate_key_type(cls, key_type: VariableType) -> VariableType:
        for validator in MapType.Validators._key_type:
            key_type = validator(key_type)
        return key_type

    @pydantic.validator("value_type")
    def _validate_value_type(cls, value_type: VariableType) -> VariableType:
        for validator in MapType.Validators._value_type:
            value_type = validator(value_type)
        return value_type

    class Validators:
        _key_type: typing.ClassVar[typing.List[typing.Callable[[VariableType], VariableType]]] = []
        _value_type: typing.ClassVar[typing.List[typing.Callable[[VariableType], VariableType]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["key_type"]
        ) -> typing.Callable[
            [typing.Callable[[VariableType], VariableType]], typing.Callable[[VariableType], VariableType]
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["value_type"]
        ) -> typing.Callable[
            [typing.Callable[[VariableType], VariableType]], typing.Callable[[VariableType], VariableType]
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "key_type":
                    cls._key_type.append(validator)
                elif field_name == "value_type":
                    cls._value_type.append(validator)
                else:
                    raise RuntimeError("Field does not exist on MapType: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True


from .variable_type import VariableType  # noqa: E402

MapType.update_forward_refs()
