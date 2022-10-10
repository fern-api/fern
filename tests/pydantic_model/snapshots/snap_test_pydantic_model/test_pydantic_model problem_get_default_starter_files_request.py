import typing

import pydantic
import typing_extensions

from ..commons.variable_type import VariableType
from .variable_type_and_name import VariableTypeAndName


class GetDefaultStarterFilesRequest(pydantic.BaseModel):
    input_params: typing.List[VariableTypeAndName] = pydantic.Field(alias="inputParams")
    output_type: VariableType = pydantic.Field(alias="outputType")
    method_name: str = pydantic.Field(alias="methodName")

    @pydantic.validator("input_params")
    def _validate_input_params(cls, input_params: typing.List[VariableTypeAndName]) -> typing.List[VariableTypeAndName]:
        for validator in GetDefaultStarterFilesRequest.Validators._input_params:
            input_params = validator(input_params)
        return input_params

    @pydantic.validator("output_type")
    def _validate_output_type(cls, output_type: VariableType) -> VariableType:
        for validator in GetDefaultStarterFilesRequest.Validators._output_type:
            output_type = validator(output_type)
        return output_type

    @pydantic.validator("method_name")
    def _validate_method_name(cls, method_name: str) -> str:
        for validator in GetDefaultStarterFilesRequest.Validators._method_name:
            method_name = validator(method_name)
        return method_name

    class Validators:
        _input_params: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[VariableTypeAndName]], typing.List[VariableTypeAndName]]]
        ] = []
        _output_type: typing.ClassVar[typing.List[typing.Callable[[VariableType], VariableType]]] = []
        _method_name: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["input_params"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[VariableTypeAndName]], typing.List[VariableTypeAndName]]],
            typing.Callable[[typing.List[VariableTypeAndName]], typing.List[VariableTypeAndName]],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["output_type"]
        ) -> typing.Callable[
            [typing.Callable[[VariableType], VariableType]], typing.Callable[[VariableType], VariableType]
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["method_name"]
        ) -> typing.Callable[[typing.Callable[[str], str]], typing.Callable[[str], str]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "input_params":
                    cls._input_params.append(validator)
                elif field_name == "output_type":
                    cls._output_type.append(validator)
                elif field_name == "method_name":
                    cls._method_name.append(validator)
                else:
                    raise RuntimeError("Field does not exist on GetDefaultStarterFilesRequest: " + field_name)

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
