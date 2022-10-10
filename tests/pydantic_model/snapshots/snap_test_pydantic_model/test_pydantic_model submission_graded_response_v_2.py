import typing

import pydantic
import typing_extensions

from ..v_2.problem.test_case_id import TestCaseId
from .submission_id import SubmissionId
from .test_case_grade import TestCaseGrade


class GradedResponseV2(pydantic.BaseModel):
    submission_id: SubmissionId = pydantic.Field(alias="submissionId")
    test_cases: typing.Dict[TestCaseId, TestCaseGrade] = pydantic.Field(alias="testCases")

    @pydantic.validator("submission_id")
    def _validate_submission_id(cls, submission_id: SubmissionId) -> SubmissionId:
        for validator in GradedResponseV2.Validators._submission_id:
            submission_id = validator(submission_id)
        return submission_id

    @pydantic.validator("test_cases")
    def _validate_test_cases(
        cls, test_cases: typing.Dict[TestCaseId, TestCaseGrade]
    ) -> typing.Dict[TestCaseId, TestCaseGrade]:
        for validator in GradedResponseV2.Validators._test_cases:
            test_cases = validator(test_cases)
        return test_cases

    class Validators:
        _submission_id: typing.ClassVar[typing.List[typing.Callable[[SubmissionId], SubmissionId]]] = []
        _test_cases: typing.ClassVar[
            typing.List[
                typing.Callable[[typing.Dict[TestCaseId, TestCaseGrade]], typing.Dict[TestCaseId, TestCaseGrade]]
            ]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["submission_id"]
        ) -> typing.Callable[
            [typing.Callable[[SubmissionId], SubmissionId]], typing.Callable[[SubmissionId], SubmissionId]
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["test_cases"]
        ) -> typing.Callable[
            [typing.Callable[[typing.Dict[TestCaseId, TestCaseGrade]], typing.Dict[TestCaseId, TestCaseGrade]]],
            typing.Callable[[typing.Dict[TestCaseId, TestCaseGrade]], typing.Dict[TestCaseId, TestCaseGrade]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "submission_id":
                    cls._submission_id.append(validator)
                elif field_name == "test_cases":
                    cls._test_cases.append(validator)
                else:
                    raise RuntimeError("Field does not exist on GradedResponseV2: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().dict(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
