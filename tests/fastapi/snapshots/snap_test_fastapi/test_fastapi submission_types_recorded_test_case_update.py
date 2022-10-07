import typing

import pydantic
import typing_extensions

from ...v_2.problem.types.test_case_id import TestCaseId


class RecordedTestCaseUpdate(pydantic.BaseModel):
    test_case_id: TestCaseId = pydantic.Field(alias="testCaseId")
    trace_responses_size: int = pydantic.Field(alias="traceResponsesSize")

    @pydantic.validator("test_case_id")
    def _validate_test_case_id(cls, test_case_id: TestCaseId) -> TestCaseId:
        for validator in RecordedTestCaseUpdate.Validators._test_case_id:
            test_case_id = validator(test_case_id)
        return test_case_id

    @pydantic.validator("trace_responses_size")
    def _validate_trace_responses_size(cls, trace_responses_size: int) -> int:
        for validator in RecordedTestCaseUpdate.Validators._trace_responses_size:
            trace_responses_size = validator(trace_responses_size)
        return trace_responses_size

    class Validators:
        _test_case_id: typing.ClassVar[typing.List[typing.Callable[[TestCaseId], TestCaseId]]] = []
        _trace_responses_size: typing.ClassVar[typing.List[typing.Callable[[int], int]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["test_case_id"]
        ) -> typing.Callable[[typing.Callable[[TestCaseId], TestCaseId]], typing.Callable[[TestCaseId], TestCaseId]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["trace_responses_size"]
        ) -> typing.Callable[[typing.Callable[[int], int]], typing.Callable[[int], int]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "test_case_id":
                    cls._test_case_id.append(validator)
                elif field_name == "trace_responses_size":
                    cls._trace_responses_size.append(validator)
                else:
                    raise RuntimeError("Field does not exist on RecordedTestCaseUpdate: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
