import typing

import pydantic
import typing_extensions

from .test_case_result_with_stdout import TestCaseResultWithStdout


class TracedTestCase(pydantic.BaseModel):
    result: TestCaseResultWithStdout
    trace_responses_size: int = pydantic.Field(alias="traceResponsesSize")

    @pydantic.validator("result")
    def _validate_result(cls, result: TestCaseResultWithStdout) -> TestCaseResultWithStdout:
        for validator in TracedTestCase.Validators._result:
            result = validator(result)
        return result

    @pydantic.validator("trace_responses_size")
    def _validate_trace_responses_size(cls, trace_responses_size: int) -> int:
        for validator in TracedTestCase.Validators._trace_responses_size:
            trace_responses_size = validator(trace_responses_size)
        return trace_responses_size

    class Validators:
        _result: typing.ClassVar[TestCaseResultWithStdout] = []
        _trace_responses_size: typing.ClassVar[int] = []

        @typing.overload
        @classmethod
        def field(result: typing_extensions.Literal["result"]) -> TestCaseResultWithStdout:
            ...

        @typing.overload
        @classmethod
        def field(trace_responses_size: typing_extensions.Literal["trace_responses_size"]) -> int:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "result":
                    cls._result.append(validator)  # type: ignore
                elif field_name == "trace_responses_size":
                    cls._trace_responses_size.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on TracedTestCase: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
