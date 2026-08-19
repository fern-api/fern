from pydantic import BaseModel
from resources.commons.types.variable_type import VariableType
from dt import datetime
from core.datetime_utils import serialize_datetime
class Parameter(BaseModel):
    parameter_id: str = 
    name: str
    variable_type: VariableType = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

