from pydantic import BaseModel
from typing import Set
from resources.commons.types.variable_type import VariableType
from dt import datetime
from core.datetime_utils import serialize_datetime
class LightweightProblemInfoV2(BaseModel):
    problem_id: str = 
    problem_name: str = 
    problem_version: int = 
    variable_types: Set[VariableType] = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

