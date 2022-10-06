import typing

import pydantic
import typing_extensions

from .function_implementation_for_multiple_languages import FunctionImplementationForMultipleLanguages
from .parameter import Parameter


class VoidFunctionDefinitionThatTakesActualResult(pydantic.BaseModel):
    additional_parameters: typing.List[Parameter] = pydantic.Field(alias="additionalParameters")
    code: FunctionImplementationForMultipleLanguages

    @pydantic.validator("additional_parameters")
    def _validate_additional_parameters(cls, additional_parameters: typing.List[Parameter]) -> typing.List[Parameter]:
        for validator in VoidFunctionDefinitionThatTakesActualResult.Validators._additional_parameters:
            additional_parameters = validator(additional_parameters)
        return additional_parameters

    @pydantic.validator("code")
    def _validate_code(
        cls, code: FunctionImplementationForMultipleLanguages
    ) -> FunctionImplementationForMultipleLanguages:
        for validator in VoidFunctionDefinitionThatTakesActualResult.Validators._code:
            code = validator(code)
        return code

    class Validators:
        _additional_parameters: typing.ClassVar[typing.List[Parameter]] = []
        _code: typing.ClassVar[FunctionImplementationForMultipleLanguages] = []

        @typing.overload
        @classmethod
        def field(additional_parameters: typing_extensions.Literal["additional_parameters"]) -> typing.List[Parameter]:
            ...

        @typing.overload
        @classmethod
        def field(code: typing_extensions.Literal["code"]) -> FunctionImplementationForMultipleLanguages:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "additional_parameters":
                    cls._additional_parameters.append(validator)  # type: ignore
                elif field_name == "code":
                    cls._code.append(validator)  # type: ignore
                else:
                    raise RuntimeError(
                        "Field does not exist on VoidFunctionDefinitionThatTakesActualResult: " + field_name
                    )

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
