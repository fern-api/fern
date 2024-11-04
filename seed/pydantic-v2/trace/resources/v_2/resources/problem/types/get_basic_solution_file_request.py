from pydantic import BaseModel
from resources.v_2.resources.problem.types.non_void_function_signature import (
    NonVoidFunctionSignature,
)


class GetBasicSolutionFileRequest(BaseModel):
    method_name: str = Field(alias="methodName")
    signature: NonVoidFunctionSignature
