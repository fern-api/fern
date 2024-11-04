from pydantic import BaseModel
from resources.commons.types import VariableType


class Parameter(BaseModel):
    parameter_id: str
    name: str
    variable_type: VariableType
