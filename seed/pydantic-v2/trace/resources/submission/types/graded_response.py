from pydantic import BaseModel
from uuid import UUID
from typing import Dict
from resources.submission.types.test_case_result_with_stdout import (
    TestCaseResultWithStdout,
)


class GradedResponse(BaseModel):
    submission_id: UUID = Field(alias="submissionId")
    test_cases: Dict[str, TestCaseResultWithStdout] = Field(alias="testCases")
