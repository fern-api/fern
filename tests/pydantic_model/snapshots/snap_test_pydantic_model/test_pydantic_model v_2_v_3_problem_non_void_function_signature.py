import typing

import pydantic
import typing_extensions

from ....commons.variable_type import VariableType
from .parameter import Parameter


class NonVoidFunctionSignature(pydantic.BaseModel):
    parameters: typing.List[Parameter]
    return_type: VariableType = pydantic.Field(alias="returnType")

    @pydantic.validator("parameters")
    def _validate_parameters(cls, parameters: typing.List[Parameter]) -> typing.List[Parameter]:
        for validator in NonVoidFunctionSignature.Validators._parameters:
            parameters = validator(parameters)
        return parameters

    @pydantic.validator("return_type")
    def _validate_return_type(cls, return_type: VariableType) -> VariableType:
        for validator in NonVoidFunctionSignature.Validators._return_type:
            return_type = validator(return_type)
        return return_type

    class Validators:
        _parameters: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[Parameter]], typing.List[Parameter]]]
        ] = []
        _return_type: typing.ClassVar[typing.List[typing.Callable[[VariableType], VariableType]]] = []

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
            cls, field_name: typing_extensions.Literal["return_type"]
        ) -> typing.Callable[
            [typing.Callable[[VariableType], VariableType]], typing.Callable[[VariableType], VariableType]
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "parameters":
                    cls._parameters.append(validator)
                elif field_name == "return_type":
                    cls._return_type.append(validator)
                else:
                    raise RuntimeError("Field does not exist on NonVoidFunctionSignature: " + field_name)

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
