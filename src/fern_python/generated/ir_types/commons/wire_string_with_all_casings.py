import typing

import pydantic
import typing_extensions

from .string_with_all_casings import StringWithAllCasings


class WireStringWithAllCasings(StringWithAllCasings):
    wire_value: str = pydantic.Field(alias="wireValue")

    @pydantic.validator("wire_value")
    def _validate_wire_value(cls, wire_value: str) -> str:
        for validator in WireStringWithAllCasings.Validators._wire_value:
            wire_value = validator(wire_value)
        return wire_value

    class Validators:
        _wire_value: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["wire_value"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "wire_value":
                    cls._wire_value.append(validator)
                else:
                    raise RuntimeError("Field does not exist on WireStringWithAllCasings: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
