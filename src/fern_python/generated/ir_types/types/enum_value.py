import typing

import pydantic
import typing_extensions

from ..commons.wire_string_with_all_casings import WireStringWithAllCasings
from ..commons.with_docs import WithDocs


class EnumValue(WithDocs):
    name: WireStringWithAllCasings
    value: str

    @pydantic.validator("name")
    def _validate_name(cls, name: WireStringWithAllCasings) -> WireStringWithAllCasings:
        for validator in EnumValue.Validators._name:
            name = validator(name)
        return name

    @pydantic.validator("value")
    def _validate_value(cls, value: str) -> str:
        for validator in EnumValue.Validators._value:
            value = validator(value)
        return value

    class Validators:
        _name: typing.ClassVar[typing.List[typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings]]] = []
        _value: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["name"]
        ) -> typing.Callable[
            [typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings]],
            typing.Callable[[WireStringWithAllCasings], WireStringWithAllCasings],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["value"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "name":
                    cls._name.append(validator)
                elif field_name == "value":
                    cls._value.append(validator)
                else:
                    raise RuntimeError("Field does not exist on EnumValue: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
