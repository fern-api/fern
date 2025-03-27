from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.commons.types.debug_variable_value import DebugVariableValue

from pydantic import BaseModel


class DebugKeyValuePairs(BaseModel):
    key: DebugVariableValue
    value: DebugVariableValue

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
