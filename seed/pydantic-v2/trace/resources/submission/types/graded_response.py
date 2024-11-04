from pydantic import BaseModel
from uuid import UUID
from typing import Dict
from resources.submission.types import TestCaseResultWithStdout


class GradedResponse(BaseModel):
    submission_id: UUID
    test_cases: Dict[str, TestCaseResultWithStdout]
