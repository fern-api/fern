import typing

import pydantic
import typing_extensions

from ....commons.variable_type import VariableType
from .parameter import Parameter


class VoidFunctionSignatureThatTakesActualResult(pydantic.BaseModel):
    parameters: typing.List[Parameter]
    actual_result_type: VariableType = pydantic.Field(alias="actualResultType")

    @pydantic.validator("parameters")
    def _validate_parameters(cls, parameters: typing.List[Parameter]) -> typing.List[Parameter]:
        for validator in VoidFunctionSignatureThatTakesActualResult.Validators._parameters:
            parameters = validator(parameters)
        return parameters

    @pydantic.validator("actual_result_type")
    def _validate_actual_result_type(cls, actual_result_type: VariableType) -> VariableType:
        for validator in VoidFunctionSignatureThatTakesActualResult.Validators._actual_result_type:
            actual_result_type = validator(actual_result_type)
        return actual_result_type

    class Validators:
        _parameters: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[Parameter]], typing.List[Parameter]]]
        ] = []
        _actual_result_type: typing.ClassVar[typing.List[typing.Callable[[VariableType], VariableType]]] = []

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
            cls, field_name: typing_extensions.Literal["actual_result_type"]
        ) -> typing.Callable[
            [typing.Callable[[VariableType], VariableType]], typing.Callable[[VariableType], VariableType]
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "parameters":
                    cls._parameters.append(validator)
                elif field_name == "actual_result_type":
                    cls._actual_result_type.append(validator)
                else:
                    raise RuntimeError(
                        "Field does not exist on VoidFunctionSignatureThatTakesActualResult: " + field_name
                    )

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
