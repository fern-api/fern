import typing

import pydantic
import typing_extensions


class GenericValue(pydantic.BaseModel):
    stringified_type: typing.Optional[str] = pydantic.Field(alias="stringifiedType")
    stringified_value: str = pydantic.Field(alias="stringifiedValue")

    @pydantic.validator("stringified_type")
    def _validate_stringified_type(cls, stringified_type: typing.Optional[str]) -> typing.Optional[str]:
        for validator in GenericValue.Validators._stringified_type:
            stringified_type = validator(stringified_type)
        return stringified_type

    @pydantic.validator("stringified_value")
    def _validate_stringified_value(cls, stringified_value: str) -> str:
        for validator in GenericValue.Validators._stringified_value:
            stringified_value = validator(stringified_value)
        return stringified_value

    class Validators:
        _stringified_type: typing.ClassVar[
            typing.List[typing.Callable[[typing.Optional[str]], typing.Optional[str]]]
        ] = []
        _stringified_value: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["stringified_type"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Optional[str]], typing.Optional[str]]],
            typing.Callable[[typing.Optional[str]], typing.Optional[str]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["stringified_value"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "stringified_type":
                    cls._stringified_type.append(validator)
                elif field_name == "stringified_value":
                    cls._stringified_value.append(validator)
                else:
                    raise RuntimeError("Field does not exist on GenericValue: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().dict(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
