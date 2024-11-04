from pydantic import BaseModel
from resources.commons.types import VariableValue


class KeyValuePair(BaseModel):
    key: VariableValue
    value: VariableValue
