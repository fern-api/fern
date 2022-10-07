import typing

import pydantic
import typing_extensions


class StringWithAllCasings(pydantic.BaseModel):
    original_value: str = pydantic.Field(alias="originalValue")
    camel_case: str = pydantic.Field(alias="camelCase")
    pascal_case: str = pydantic.Field(alias="pascalCase")
    snake_case: str = pydantic.Field(alias="snakeCase")
    screaming_snake_case: str = pydantic.Field(alias="screamingSnakeCase")

    @pydantic.validator("original_value")
    def _validate_original_value(cls, original_value: str) -> str:
        for validator in StringWithAllCasings.Validators._original_value:
            original_value = validator(original_value)
        return original_value

    @pydantic.validator("camel_case")
    def _validate_camel_case(cls, camel_case: str) -> str:
        for validator in StringWithAllCasings.Validators._camel_case:
            camel_case = validator(camel_case)
        return camel_case

    @pydantic.validator("pascal_case")
    def _validate_pascal_case(cls, pascal_case: str) -> str:
        for validator in StringWithAllCasings.Validators._pascal_case:
            pascal_case = validator(pascal_case)
        return pascal_case

    @pydantic.validator("snake_case")
    def _validate_snake_case(cls, snake_case: str) -> str:
        for validator in StringWithAllCasings.Validators._snake_case:
            snake_case = validator(snake_case)
        return snake_case

    @pydantic.validator("screaming_snake_case")
    def _validate_screaming_snake_case(cls, screaming_snake_case: str) -> str:
        for validator in StringWithAllCasings.Validators._screaming_snake_case:
            screaming_snake_case = validator(screaming_snake_case)
        return screaming_snake_case

    class Validators:
        _original_value: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _camel_case: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _pascal_case: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _snake_case: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []
        _screaming_snake_case: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["original_value"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["camel_case"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["pascal_case"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["snake_case"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["screaming_snake_case"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "original_value":
                    cls._original_value.append(validator)
                elif field_name == "camel_case":
                    cls._camel_case.append(validator)
                elif field_name == "pascal_case":
                    cls._pascal_case.append(validator)
                elif field_name == "snake_case":
                    cls._snake_case.append(validator)
                elif field_name == "screaming_snake_case":
                    cls._screaming_snake_case.append(validator)
                else:
                    raise RuntimeError("Field does not exist on StringWithAllCasings: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
