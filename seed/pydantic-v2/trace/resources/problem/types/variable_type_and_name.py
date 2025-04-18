from pydantic import BaseModel
from resources.commons.types.variable_type import VariableType
from dt import datetime
from core.datetime_utils import serialize_datetime
class VariableTypeAndName(BaseModel):
    variable_type: VariableType = 
    name: str
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

