from pydantic import BaseModel
from resources.commons.types.variable_type import VariableType


class MapType(BaseModel):
    key_type: VariableType = Field(alias="keyType")
    value_type: VariableType = Field(alias="valueType")
