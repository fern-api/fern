import pydantic

from ..commons.variable_type import VariableType


class VariableTypeAndName(pydantic.BaseModel):
    variable_type: VariableType = pydantic.Field(alias="variableType")
    name: str

    class Config:
        allow_population_by_field_name = True
