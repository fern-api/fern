from typing import List

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.commons.types.variable_value import VariableValue

from pydantic import BaseModel


class TestCase(BaseModel):
    id: str
    params: List[VariableValue]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
