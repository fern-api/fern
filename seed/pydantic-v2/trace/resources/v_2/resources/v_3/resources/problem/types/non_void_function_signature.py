from pydantic import BaseModel
from typing import List
from resources.v_2.resources.v_3.resources.problem.types.parameter import Parameter
from resources.commons.types.variable_type import VariableType


class NonVoidFunctionSignature(BaseModel):
    parameters: List[Parameter]
    return_type: VariableType = Field(alias="returnType")
