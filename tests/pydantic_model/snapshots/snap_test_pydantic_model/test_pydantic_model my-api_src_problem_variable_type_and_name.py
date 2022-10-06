import typing

import pydantic
import typing_extensions

from ..commons.variable_type import VariableType


class VariableTypeAndName(pydantic.BaseModel):
    variable_type: VariableType = pydantic.Field(alias="variableType")
    name: str

    @pydantic.validator("variable_type")
    def _validate_variable_type(cls, variable_type: VariableType) -> VariableType:
        for validator in VariableTypeAndName.Validators._variable_type:
            variable_type = validator(variable_type)
        return variable_type

    @pydantic.validator("name")
    def _validate_name(cls, name: str) -> str:
        for validator in VariableTypeAndName.Validators._name:
            name = validator(name)
        return name

    class Validators:
        _variable_type: typing.ClassVar[VariableType] = []
        _name: typing.ClassVar[str] = []

        @typing.overload
        @classmethod
        def field(variable_type: typing_extensions.Literal["variable_type"]) -> VariableType:
            ...

        @typing.overload
        @classmethod
        def field(name: typing_extensions.Literal["name"]) -> str:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "variable_type":
                    cls._variable_type.append(validator)  # type: ignore
                elif field_name == "name":
                    cls._name.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on VariableTypeAndName: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
