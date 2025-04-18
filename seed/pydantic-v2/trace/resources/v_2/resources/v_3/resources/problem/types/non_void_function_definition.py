from pydantic import BaseModel
from resources.v_2.resources.v_3.resources.problem.types.non_void_function_signature import NonVoidFunctionSignature
from resources.v_2.resources.v_3.resources.problem.types.function_implementation_for_multiple_languages import FunctionImplementationForMultipleLanguages
from dt import datetime
from core.datetime_utils import serialize_datetime
class NonVoidFunctionDefinition(BaseModel):
    signature: NonVoidFunctionSignature
    code: FunctionImplementationForMultipleLanguages
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

