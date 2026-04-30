from pydantic import BaseModel
from resources.v_2.resources.v_3.resources.problem.types.non_void_function_signature import NonVoidFunctionSignature
from dt import datetime
from core.datetime_utils import serialize_datetime
class GetBasicSolutionFileRequest(BaseModel):
    method_name: str = 
    signature: NonVoidFunctionSignature
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

