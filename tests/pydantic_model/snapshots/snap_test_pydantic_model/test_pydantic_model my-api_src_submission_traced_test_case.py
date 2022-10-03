import pydantic

from .test_case_result_with_stdout import TestCaseResultWithStdout


class TracedTestCase(pydantic.BaseModel):
    result: TestCaseResultWithStdout
    trace_responses_size: int = pydantic.Field(alias="traceResponsesSize")

    class Config:
        allow_population_by_field_name = True
