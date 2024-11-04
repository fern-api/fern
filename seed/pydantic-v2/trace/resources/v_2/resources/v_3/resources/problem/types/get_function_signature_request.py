from pydantic import BaseModel
from resources.v_2.resources.v_3.resources.problem.types import FunctionSignature


class GetFunctionSignatureRequest(BaseModel):
    function_signature: FunctionSignature
