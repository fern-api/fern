from pydantic import BaseModel
from typing import List
from resources.v_2.resources.v_3.resources.problem.types import (
    Parameter,
    FunctionImplementationForMultipleLanguages,
)


class VoidFunctionDefinition(BaseModel):
    parameters: List[Parameter]
    code: FunctionImplementationForMultipleLanguages
