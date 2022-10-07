import typing

import pydantic
import typing_extensions

from ..commons.language import Language


class UnexpectedLanguageError(pydantic.BaseModel):
    expected_language: Language = pydantic.Field(alias="expectedLanguage")
    actual_language: Language = pydantic.Field(alias="actualLanguage")

    @pydantic.validator("expected_language")
    def _validate_expected_language(cls, expected_language: Language) -> Language:
        for validator in UnexpectedLanguageError.Validators._expected_language:
            expected_language = validator(expected_language)
        return expected_language

    @pydantic.validator("actual_language")
    def _validate_actual_language(cls, actual_language: Language) -> Language:
        for validator in UnexpectedLanguageError.Validators._actual_language:
            actual_language = validator(actual_language)
        return actual_language

    class Validators:
        _expected_language: typing.ClassVar[typing.List[typing.Callable[[Language], Language]]] = []
        _actual_language: typing.ClassVar[typing.List[typing.Callable[[Language], Language]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["expected_language"]
        ) -> typing.Callable[[typing.Callable[[Language], Language]], typing.Callable[[Language], Language]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["actual_language"]
        ) -> typing.Callable[[typing.Callable[[Language], Language]], typing.Callable[[Language], Language]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "expected_language":
                    cls._expected_language.append(validator)
                elif field_name == "actual_language":
                    cls._actual_language.append(validator)
                else:
                    raise RuntimeError("Field does not exist on UnexpectedLanguageError: " + field_name)

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
