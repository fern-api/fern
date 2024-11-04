from pydantic import BaseModel
from typing import Dict
from resources.commons.types.language import Language
from resources.v_2.resources.v_3.resources.problem.types.function_implementation import FunctionImplementation
from dt import datetime
from core.datetime_utils import serialize_datetime
class FunctionImplementationForMultipleLanguages(BaseModel):
    code_by_language: Dict[Language, FunctionImplementation] = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

