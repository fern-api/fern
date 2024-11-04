from pydantic import BaseModel


class RecordedTestCaseUpdate(BaseModel):
    test_case_id: str
    trace_responses_size: int
