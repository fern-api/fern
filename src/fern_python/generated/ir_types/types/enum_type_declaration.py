import typing

import pydantic
import typing_extensions

from .enum_value import EnumValue


class EnumTypeDeclaration(pydantic.BaseModel):
    values: typing.List[EnumValue]

    @pydantic.validator("values")
    def _validate_values(cls, values: typing.List[EnumValue]) -> typing.List[EnumValue]:
        for validator in EnumTypeDeclaration.Validators._values:
            values = validator(values)
        return values

    class Validators:
        _values: typing.ClassVar[typing.List[typing.Callable[[typing.List[EnumValue]], typing.List[EnumValue]]]] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["values"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[EnumValue]], typing.List[EnumValue]]],
            typing.Callable[[typing.List[EnumValue]], typing.List[EnumValue]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "values":
                    cls._values.append(validator)
                else:
                    raise RuntimeError("Field does not exist on EnumTypeDeclaration: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
