from pydantic import BaseModel
from typing import List
from resources.v_2.resources.problem.types.parameter import Parameter
from dt import datetime
from core.datetime_utils import serialize_datetime
class VoidFunctionSignature(BaseModel):
    parameters: List[Parameter]
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

