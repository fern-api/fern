from pydantic import BaseModel
from typing import List
from resources.submission.types.test_submission_update import TestSubmissionUpdate
from resources.v_2.resources.problem.types.problem_info_v_2 import ProblemInfoV2


class TestSubmissionStatusV2(BaseModel):
    updates: List[TestSubmissionUpdate]
    problem_id: str = Field(alias="problemId")
    problem_version: int = Field(alias="problemVersion")
    problem_info: ProblemInfoV2 = Field(alias="problemInfo")
