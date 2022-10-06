import typing

import pydantic
import typing_extensions

from .function_implementation_for_multiple_languages import FunctionImplementationForMultipleLanguages
from .parameter import Parameter


class VoidFunctionDefinition(pydantic.BaseModel):
    parameters: typing.List[Parameter]
    code: FunctionImplementationForMultipleLanguages

    @pydantic.validator("parameters")
    def _validate_parameters(cls, parameters: typing.List[Parameter]) -> typing.List[Parameter]:
        for validator in VoidFunctionDefinition.Validators._parameters:
            parameters = validator(parameters)
        return parameters

    @pydantic.validator("code")
    def _validate_code(
        cls, code: FunctionImplementationForMultipleLanguages
    ) -> FunctionImplementationForMultipleLanguages:
        for validator in VoidFunctionDefinition.Validators._code:
            code = validator(code)
        return code

    class Validators:
        _parameters: typing.ClassVar[typing.List[Parameter]] = []
        _code: typing.ClassVar[FunctionImplementationForMultipleLanguages] = []

        @typing.overload
        @classmethod
        def field(parameters: typing_extensions.Literal["parameters"]) -> typing.List[Parameter]:
            ...

        @typing.overload
        @classmethod
        def field(code: typing_extensions.Literal["code"]) -> FunctionImplementationForMultipleLanguages:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "parameters":
                    cls._parameters.append(validator)  # type: ignore
                elif field_name == "code":
                    cls._code.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on VoidFunctionDefinition: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
