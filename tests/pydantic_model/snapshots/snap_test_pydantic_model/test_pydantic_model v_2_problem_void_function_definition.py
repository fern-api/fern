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
        _parameters: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[Parameter]], typing.List[Parameter]]]
        ] = []
        _code: typing.ClassVar[
            typing.List[
                typing.Callable[
                    [FunctionImplementationForMultipleLanguages], FunctionImplementationForMultipleLanguages
                ]
            ]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["parameters"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[Parameter]], typing.List[Parameter]]],
            typing.Callable[[typing.List[Parameter]], typing.List[Parameter]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["code"]
        ) -> typing.Callable[
            [typing.Callable[[FunctionImplementationForMultipleLanguages], FunctionImplementationForMultipleLanguages]],
            typing.Callable[[FunctionImplementationForMultipleLanguages], FunctionImplementationForMultipleLanguages],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "parameters":
                    cls._parameters.append(validator)
                elif field_name == "code":
                    cls._code.append(validator)
                else:
                    raise RuntimeError("Field does not exist on VoidFunctionDefinition: " + field_name)

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
