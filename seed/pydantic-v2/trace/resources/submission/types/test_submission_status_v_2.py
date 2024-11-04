from pydantic import BaseModel
from typing import List
from resources.submission.types import TestSubmissionUpdate
from resources.v_2.resources.problem.types import ProblemInfoV2


class TestSubmissionStatusV2(BaseModel):
    updates: List[TestSubmissionUpdate]
    problem_id: str
    problem_version: int
    problem_info: ProblemInfoV2
