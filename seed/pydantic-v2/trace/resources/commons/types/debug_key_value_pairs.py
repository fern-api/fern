from pydantic import BaseModel
from resources.commons.types import DebugVariableValue


class DebugKeyValuePairs(BaseModel):
    key: DebugVariableValue
    value: DebugVariableValue
