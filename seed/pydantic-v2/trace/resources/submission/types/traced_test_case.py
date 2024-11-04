from pydantic import BaseModel
from resources.submission.types.test_case_result_with_stdout import (
    TestCaseResultWithStdout,
)


class TracedTestCase(BaseModel):
    result: TestCaseResultWithStdout
    trace_responses_size: int = Field(alias="traceResponsesSize")
