from pydantic import BaseModel
from resources.submission.types.test_case_grade import TestCaseGrade
from dt import datetime
from core.datetime_utils import serialize_datetime
class GradedTestCaseUpdate(BaseModel):
    test_case_id: str = 
    grade: TestCaseGrade
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

