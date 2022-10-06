import typing

import pydantic
import typing_extensions

from ....commons.variable_type import VariableType
from .parameter_id import ParameterId


class Parameter(pydantic.BaseModel):
    parameter_id: ParameterId = pydantic.Field(alias="parameterId")
    name: str
    variable_type: VariableType = pydantic.Field(alias="variableType")

    @pydantic.validator("parameter_id")
    def _validate_parameter_id(cls, parameter_id: ParameterId) -> ParameterId:
        for validator in Parameter.Validators._parameter_id:
            parameter_id = validator(parameter_id)
        return parameter_id

    @pydantic.validator("name")
    def _validate_name(cls, name: str) -> str:
        for validator in Parameter.Validators._name:
            name = validator(name)
        return name

    @pydantic.validator("variable_type")
    def _validate_variable_type(cls, variable_type: VariableType) -> VariableType:
        for validator in Parameter.Validators._variable_type:
            variable_type = validator(variable_type)
        return variable_type

    class Validators:
        _parameter_id: typing.ClassVar[ParameterId] = []
        _name: typing.ClassVar[str] = []
        _variable_type: typing.ClassVar[VariableType] = []

        @typing.overload
        @classmethod
        def field(parameter_id: typing_extensions.Literal["parameter_id"]) -> ParameterId:
            ...

        @typing.overload
        @classmethod
        def field(name: typing_extensions.Literal["name"]) -> str:
            ...

        @typing.overload
        @classmethod
        def field(variable_type: typing_extensions.Literal["variable_type"]) -> VariableType:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "parameter_id":
                    cls._parameter_id.append(validator)  # type: ignore
                elif field_name == "name":
                    cls._name.append(validator)  # type: ignore
                elif field_name == "variable_type":
                    cls._variable_type.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on Parameter: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
