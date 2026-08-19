from pydantic import BaseModel
from typing import Dict
from resources.commons.types.language import Language
from dt import datetime
from core.datetime_utils import serialize_datetime
class GetFunctionSignatureResponse(BaseModel):
    function_by_language: Dict[Language, str] = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

