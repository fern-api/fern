from pydantic import BaseModel
from resources.v_2.resources.v_3.resources.problem.types.function_signature import FunctionSignature
from dt import datetime
from core.datetime_utils import serialize_datetime
class GetFunctionSignatureRequest(BaseModel):
    function_signature: FunctionSignature = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

