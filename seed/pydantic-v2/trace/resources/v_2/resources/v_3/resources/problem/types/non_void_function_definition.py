from pydantic import BaseModel
from resources.v_2.resources.v_3.resources.problem.types import (
    NonVoidFunctionSignature,
    FunctionImplementationForMultipleLanguages,
)


class NonVoidFunctionDefinition(BaseModel):
    signature: NonVoidFunctionSignature
    code: FunctionImplementationForMultipleLanguages
