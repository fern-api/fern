from pydantic import BaseModel
from dt import datetime
from core.datetime_utils import serialize_datetime
class RecordedTestCaseUpdate(BaseModel):
    test_case_id: str = 
    trace_responses_size: int = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

