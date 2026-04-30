from pydantic import BaseModel
from typing import Dict
from resources.commons.types.debug_variable_value import DebugVariableValue
from dt import datetime
from core.datetime_utils import serialize_datetime
class Scope(BaseModel):
    variables: Dict[str, DebugVariableValue]
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

