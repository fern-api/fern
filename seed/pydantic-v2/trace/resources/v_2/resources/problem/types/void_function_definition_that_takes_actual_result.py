from pydantic import BaseModel
from typing import List
from resources.v_2.resources.problem.types import (
    Parameter,
    FunctionImplementationForMultipleLanguages,
)


class VoidFunctionDefinitionThatTakesActualResult(BaseModel):
    additional_parameters: List[Parameter]
    code: FunctionImplementationForMultipleLanguages
