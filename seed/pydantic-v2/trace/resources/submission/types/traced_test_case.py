from pydantic import BaseModel
from resources.submission.types import TestCaseResultWithStdout


class TracedTestCase(BaseModel):
    result: TestCaseResultWithStdout
    trace_responses_size: int
