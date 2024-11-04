from pydantic import BaseModel
from resources.submission.types.test_case_result import TestCaseResult


class TestCaseResultWithStdout(BaseModel):
    result: TestCaseResult
    stdout: str
