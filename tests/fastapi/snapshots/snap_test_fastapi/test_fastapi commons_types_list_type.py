from __future__ import annotations

import typing

import pydantic
import typing_extensions


class ListType(pydantic.BaseModel):
    value_type: VariableType = pydantic.Field(alias="valueType")
    is_fixed_length: typing.Optional[bool] = pydantic.Field(alias="isFixedLength")

    @pydantic.validator("value_type")
    def _validate_value_type(cls, value_type: VariableType) -> VariableType:
        for validator in ListType.Validators._value_type:
            value_type = validator(value_type)
        return value_type

    @pydantic.validator("is_fixed_length")
    def _validate_is_fixed_length(cls, is_fixed_length: typing.Optional[bool]) -> typing.Optional[bool]:
        for validator in ListType.Validators._is_fixed_length:
            is_fixed_length = validator(is_fixed_length)
        return is_fixed_length

    class Validators:
        _value_type: typing.ClassVar[typing.List[typing.Callable[[VariableType], VariableType]]] = []
        _is_fixed_length: typing.ClassVar[
            typing.List[typing.Callable[[typing.Optional[bool]], typing.Optional[bool]]]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["value_type"]
        ) -> typing.Callable[
            [typing.Callable[[VariableType], VariableType]], typing.Callable[[VariableType], VariableType]
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["is_fixed_length"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Optional[bool]], typing.Optional[bool]]],
            typing.Callable[[typing.Optional[bool]], typing.Optional[bool]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "value_type":
                    cls._value_type.append(validator)
                elif field_name == "is_fixed_length":
                    cls._is_fixed_length.append(validator)
                else:
                    raise RuntimeError("Field does not exist on ListType: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True


from .variable_type import VariableType  # noqa: E402

ListType.update_forward_refs()
