from pydantic import BaseModel
from resources.submission.types import TestCaseResult


class TestCaseResultWithStdout(BaseModel):
    result: TestCaseResult
    stdout: str
