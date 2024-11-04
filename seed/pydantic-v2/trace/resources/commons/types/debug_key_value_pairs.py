from pydantic import BaseModel
from resources.commons.types.debug_variable_value import DebugVariableValue
from dt import datetime
from core.datetime_utils import serialize_datetime
class DebugKeyValuePairs(BaseModel):
    key: DebugVariableValue
    value: DebugVariableValue
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

