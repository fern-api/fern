import typing

import pydantic
import typing_extensions

from ...commons.language import Language
from .function_implementation import FunctionImplementation


class FunctionImplementationForMultipleLanguages(pydantic.BaseModel):
    code_by_language: typing.Dict[Language, FunctionImplementation] = pydantic.Field(alias="codeByLanguage")

    @pydantic.validator("code_by_language")
    def _validate_code_by_language(
        cls, code_by_language: typing.Dict[Language, FunctionImplementation]
    ) -> typing.Dict[Language, FunctionImplementation]:
        for validator in FunctionImplementationForMultipleLanguages.Validators._code_by_language:
            code_by_language = validator(code_by_language)
        return code_by_language

    class Validators:
        _code_by_language: typing.ClassVar[typing.Dict[Language, FunctionImplementation]] = []

        @typing.overload
        @classmethod
        def field(
            code_by_language: typing_extensions.Literal["code_by_language"],
        ) -> typing.Dict[Language, FunctionImplementation]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "code_by_language":
                    cls._code_by_language.append(validator)  # type: ignore
                else:
                    raise RuntimeError(
                        "Field does not exist on FunctionImplementationForMultipleLanguages: " + field_name
                    )

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
