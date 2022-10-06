import typing

import pydantic
import typing_extensions

from ..submission.test_case_result_with_stdout import TestCaseResultWithStdout
from ..submission.trace_response import TraceResponse


class StoreTracedTestCaseRequest(pydantic.BaseModel):
    result: TestCaseResultWithStdout
    trace_responses: typing.List[TraceResponse] = pydantic.Field(alias="traceResponses")

    @pydantic.validator("result")
    def _validate_result(cls, result: TestCaseResultWithStdout) -> TestCaseResultWithStdout:
        for validator in StoreTracedTestCaseRequest.Validators._result:
            result = validator(result)
        return result

    @pydantic.validator("trace_responses")
    def _validate_trace_responses(cls, trace_responses: typing.List[TraceResponse]) -> typing.List[TraceResponse]:
        for validator in StoreTracedTestCaseRequest.Validators._trace_responses:
            trace_responses = validator(trace_responses)
        return trace_responses

    class Validators:
        _result: typing.ClassVar[TestCaseResultWithStdout] = []
        _trace_responses: typing.ClassVar[typing.List[TraceResponse]] = []

        @typing.overload
        @classmethod
        def field(result: typing_extensions.Literal["result"]) -> TestCaseResultWithStdout:
            ...

        @typing.overload
        @classmethod
        def field(trace_responses: typing_extensions.Literal["trace_responses"]) -> typing.List[TraceResponse]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "result":
                    cls._result.append(validator)  # type: ignore
                elif field_name == "trace_responses":
                    cls._trace_responses.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on StoreTracedTestCaseRequest: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
