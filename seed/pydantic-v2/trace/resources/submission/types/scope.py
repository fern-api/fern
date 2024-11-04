from pydantic import BaseModel
from typing import Dict
from resources.commons.types import DebugVariableValue


class Scope(BaseModel):
    variables: Dict[str, DebugVariableValue]
