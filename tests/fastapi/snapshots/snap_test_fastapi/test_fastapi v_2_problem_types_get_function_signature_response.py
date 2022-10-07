import typing

import pydantic
import typing_extensions

from ....commons.types.language import Language


class GetFunctionSignatureResponse(pydantic.BaseModel):
    function_by_language: typing.Dict[Language, str] = pydantic.Field(alias="functionByLanguage")

    @pydantic.validator("function_by_language")
    def _validate_function_by_language(
        cls, function_by_language: typing.Dict[Language, str]
    ) -> typing.Dict[Language, str]:
        for validator in GetFunctionSignatureResponse.Validators._function_by_language:
            function_by_language = validator(function_by_language)
        return function_by_language

    class Validators:
        _function_by_language: typing.ClassVar[
            typing.List[typing.Callable[[typing.Dict[Language, str]], typing.Dict[Language, str]]]
        ] = []

        @typing.overload  # type: ignore
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["function_by_language"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Dict[Language, str]], typing.Dict[Language, str]]],
            typing.Callable[[typing.Dict[Language, str]], typing.Dict[Language, str]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "function_by_language":
                    cls._function_by_language.append(validator)
                else:
                    raise RuntimeError("Field does not exist on GetFunctionSignatureResponse: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
