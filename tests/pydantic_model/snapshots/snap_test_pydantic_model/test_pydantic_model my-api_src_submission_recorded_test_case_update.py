import pydantic

from ..v_2.problem.test_case_id import TestCaseId


class RecordedTestCaseUpdate(pydantic.BaseModel):
    test_case_id: TestCaseId = pydantic.Field(alias="testCaseId")
    trace_responses_size: int = pydantic.Field(alias="traceResponsesSize")

    class Config:
        allow_population_by_field_name = True
