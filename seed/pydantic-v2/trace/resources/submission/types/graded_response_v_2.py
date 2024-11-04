from pydantic import BaseModel
from uuid import UUID
from typing import Dict
from resources.submission.types import TestCaseGrade


class GradedResponseV2(BaseModel):
    submission_id: UUID
    test_cases: Dict[str, TestCaseGrade]
