from pydantic import BaseModel
from resources.commons.types.variable_type import VariableType
from typing import Optional
from dt import datetime
from core.datetime_utils import serialize_datetime
class ListType(BaseModel):
    value_type: VariableType = 
    is_fixed_length: Optional[bool] = 
    """
    Whether this list is fixed-size (for languages that supports fixed-size lists). Defaults to false.
    """
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

