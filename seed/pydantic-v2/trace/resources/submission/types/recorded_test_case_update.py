from pydantic import BaseModel


class RecordedTestCaseUpdate(BaseModel):
    test_case_id: str = Field(alias="testCaseId")
    trace_responses_size: int = Field(alias="traceResponsesSize")
