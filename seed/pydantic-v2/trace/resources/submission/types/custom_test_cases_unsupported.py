from pydantic import BaseModel
from uuid import UUID
from dt import datetime
from core.datetime_utils import serialize_datetime
class CustomTestCasesUnsupported(BaseModel):
    problem_id: str = 
    submission_id: UUID = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

