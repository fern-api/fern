from __future__ import annotations

import typing

import pydantic
import typing_extensions


class KeyValuePair(pydantic.BaseModel):
    key: VariableValue
    value: VariableValue

    @pydantic.validator("key")
    def _validate_key(cls, key: VariableValue) -> VariableValue:
        for validator in KeyValuePair.Validators._key:
            key = validator(key)
        return key

    @pydantic.validator("value")
    def _validate_value(cls, value: VariableValue) -> VariableValue:
        for validator in KeyValuePair.Validators._value:
            value = validator(value)
        return value

    class Validators:
        _key: typing.ClassVar[typing.List[typing.Callable[[VariableValue], VariableValue]]] = []
        _value: typing.ClassVar[typing.List[typing.Callable[[VariableValue], VariableValue]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["key"]
        ) -> typing.Callable[
            [typing.Callable[[VariableValue], VariableValue]], typing.Callable[[VariableValue], VariableValue]
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["value"]
        ) -> typing.Callable[
            [typing.Callable[[VariableValue], VariableValue]], typing.Callable[[VariableValue], VariableValue]
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "key":
                    cls._key.append(validator)
                elif field_name == "value":
                    cls._value.append(validator)
                else:
                    raise RuntimeError("Field does not exist on KeyValuePair: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True


from .variable_value import VariableValue  # noqa: E402

KeyValuePair.update_forward_refs()
