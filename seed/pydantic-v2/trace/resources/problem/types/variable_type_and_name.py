from pydantic import BaseModel
from resources.commons.types import VariableType


class VariableTypeAndName(BaseModel):
    variable_type: VariableType
    name: str
