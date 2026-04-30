from pydantic import BaseModel
from resources.commons.types.language import Language
from dt import datetime
from core.datetime_utils import serialize_datetime
class UnexpectedLanguageError(BaseModel):
    expected_language: Language = 
    actual_language: Language = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

