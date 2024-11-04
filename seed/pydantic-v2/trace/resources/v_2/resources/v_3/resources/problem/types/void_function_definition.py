from pydantic import BaseModel
from typing import List
from resources.v_2.resources.v_3.resources.problem.types.parameter import Parameter
from resources.v_2.resources.v_3.resources.problem.types.function_implementation_for_multiple_languages import (
    FunctionImplementationForMultipleLanguages,
)


class VoidFunctionDefinition(BaseModel):
    parameters: List[Parameter]
    code: FunctionImplementationForMultipleLanguages
