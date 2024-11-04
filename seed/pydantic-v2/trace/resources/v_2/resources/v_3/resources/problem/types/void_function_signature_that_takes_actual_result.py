from pydantic import BaseModel
from typing import List
from resources.v_2.resources.v_3.resources.problem.types.parameter import Parameter
from resources.commons.types.variable_type import VariableType


class VoidFunctionSignatureThatTakesActualResult(BaseModel):
    parameters: List[Parameter]
    actual_result_type: VariableType = Field(alias="actualResultType")
