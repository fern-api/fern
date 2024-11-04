from pydantic import BaseModel
from typing import List
from resources.v_2.resources.v_3.resources.problem.types.parameter import Parameter


class VoidFunctionSignature(BaseModel):
    parameters: List[Parameter]
