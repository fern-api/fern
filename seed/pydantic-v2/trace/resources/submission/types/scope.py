from pydantic import BaseModel
from typing import Dict
from resources.commons.types.debug_variable_value import DebugVariableValue


class Scope(BaseModel):
    variables: Dict[str, DebugVariableValue]
