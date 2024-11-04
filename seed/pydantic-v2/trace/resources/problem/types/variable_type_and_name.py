from pydantic import BaseModel
from resources.commons.types.variable_type import VariableType


class VariableTypeAndName(BaseModel):
    variable_type: VariableType = Field(alias="variableType")
    name: str
