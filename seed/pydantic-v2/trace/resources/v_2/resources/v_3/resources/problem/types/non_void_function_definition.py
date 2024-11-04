from pydantic import BaseModel
from resources.v_2.resources.v_3.resources.problem.types.non_void_function_signature import (
    NonVoidFunctionSignature,
)
from resources.v_2.resources.v_3.resources.problem.types.function_implementation_for_multiple_languages import (
    FunctionImplementationForMultipleLanguages,
)


class NonVoidFunctionDefinition(BaseModel):
    signature: NonVoidFunctionSignature
    code: FunctionImplementationForMultipleLanguages
