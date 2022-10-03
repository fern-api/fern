import typing

import pydantic

from ..submission.test_case_result_with_stdout import TestCaseResultWithStdout
from ..submission.trace_response import TraceResponse


class StoreTracedTestCaseRequest(pydantic.BaseModel):
    result: TestCaseResultWithStdout
    trace_responses: typing.List[TraceResponse] = pydantic.Field(alias="traceResponses")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
