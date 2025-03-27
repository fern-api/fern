from typing import Dict

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.commons.types.debug_variable_value import DebugVariableValue

from pydantic import BaseModel


class Scope(BaseModel):
    variables: Dict[str, DebugVariableValue]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
