from pydantic import BaseModel
from resources.v_2.resources.problem.types.function_signature import FunctionSignature


class GetFunctionSignatureRequest(BaseModel):
    function_signature: FunctionSignature = Field(alias="functionSignature")
