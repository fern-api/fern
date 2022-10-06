from __future__ import annotations

import typing

import pydantic
import typing_extensions


class DebugKeyValuePairs(pydantic.BaseModel):
    key: DebugVariableValue
    value: DebugVariableValue

    @pydantic.validator("key")
    def _validate_key(cls, key: DebugVariableValue) -> DebugVariableValue:
        for validator in DebugKeyValuePairs.Validators._key:
            key = validator(key)
        return key

    @pydantic.validator("value")
    def _validate_value(cls, value: DebugVariableValue) -> DebugVariableValue:
        for validator in DebugKeyValuePairs.Validators._value:
            value = validator(value)
        return value

    class Validators:
        _key: typing.ClassVar[DebugVariableValue] = []
        _value: typing.ClassVar[DebugVariableValue] = []

        @typing.overload
        @classmethod
        def field(key: typing_extensions.Literal["key"]) -> DebugVariableValue:
            ...

        @typing.overload
        @classmethod
        def field(value: typing_extensions.Literal["value"]) -> DebugVariableValue:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "key":
                    cls._key.append(validator)  # type: ignore
                elif field_name == "value":
                    cls._value.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on DebugKeyValuePairs: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True


from .debug_variable_value import DebugVariableValue  # noqa: E402

DebugKeyValuePairs.update_forward_refs()
