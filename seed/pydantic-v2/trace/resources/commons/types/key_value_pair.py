from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.commons.types.variable_value import VariableValue

from pydantic import BaseModel


class KeyValuePair(BaseModel):
    key: VariableValue
    value: VariableValue

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
