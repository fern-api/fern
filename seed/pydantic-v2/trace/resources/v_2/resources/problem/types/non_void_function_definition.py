from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.v_2.resources.problem.types.function_implementation_for_multiple_languages import (
    FunctionImplementationForMultipleLanguages,
)
from resources.v_2.resources.problem.types.non_void_function_signature import NonVoidFunctionSignature

from pydantic import BaseModel


class NonVoidFunctionDefinition(BaseModel):
    signature: NonVoidFunctionSignature
    code: FunctionImplementationForMultipleLanguages

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
