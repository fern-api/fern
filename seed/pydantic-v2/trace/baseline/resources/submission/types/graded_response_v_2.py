from pydantic import BaseModel
from uuid import UUID
from typing import Dict
from resources.submission.types.test_case_grade import TestCaseGrade
from dt import datetime
from core.datetime_utils import serialize_datetime
class GradedResponseV2(BaseModel):
    submission_id: UUID = 
    test_cases: Dict[str, TestCaseGrade] = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

