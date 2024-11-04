from pydantic import BaseModel
from resources.commons.types.variable_value import VariableValue


class KeyValuePair(BaseModel):
    key: VariableValue
    value: VariableValue
