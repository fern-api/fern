from pydantic import BaseModel
from typing import List
from resources.commons.types.variable_value import VariableValue
from dt import datetime
from core.datetime_utils import serialize_datetime
class TestCase(BaseModel):
    id: str
    params: List[VariableValue]
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

