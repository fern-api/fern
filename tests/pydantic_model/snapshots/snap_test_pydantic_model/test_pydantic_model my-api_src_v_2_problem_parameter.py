import typing

import pydantic

from ...commons.variable_type import VariableType
from .parameter_id import ParameterId


class Parameter(pydantic.BaseModel):
    parameter_id: ParameterId = pydantic.Field(alias="parameterId")
    name: str
    variable_type: VariableType = pydantic.Field(alias="variableType")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
