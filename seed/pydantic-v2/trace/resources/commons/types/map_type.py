from pydantic import BaseModel
from resources.commons.types import VariableType


class MapType(BaseModel):
    key_type: VariableType
    value_type: VariableType
