from pydantic import BaseModel
from typing import List
from resources.v_2.resources.v_3.resources.problem.types.parameter import Parameter
from resources.commons.types.variable_type import VariableType
from dt import datetime
from core.datetime_utils import serialize_datetime
class VoidFunctionSignatureThatTakesActualResult(BaseModel):
    parameters: List[Parameter]
    actual_result_type: VariableType = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

