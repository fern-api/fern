from pydantic import BaseModel
from typing import List
from resources.submission.types.test_submission_update import TestSubmissionUpdate
from resources.v_2.resources.problem.types.problem_info_v_2 import ProblemInfoV2
from dt import datetime
from core.datetime_utils import serialize_datetime
class TestSubmissionStatusV2(BaseModel):
    updates: List[TestSubmissionUpdate]
    problem_id: str = 
    problem_version: int = 
    problem_info: ProblemInfoV2 = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

