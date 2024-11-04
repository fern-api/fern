from pydantic import BaseModel
from resources.commons.types.variable_type import VariableType


class Parameter(BaseModel):
    parameter_id: str = Field(alias="parameterId")
    name: str
    variable_type: VariableType = Field(alias="variableType")
