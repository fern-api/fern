from pydantic import BaseModel
from resources.commons.types.debug_variable_value import DebugVariableValue


class DebugKeyValuePairs(BaseModel):
    key: DebugVariableValue
    value: DebugVariableValue
