import typing

import pydantic
import typing_extensions

from ..commons.problem_id import ProblemId
from .submission_id import SubmissionId


class CustomTestCasesUnsupported(pydantic.BaseModel):
    problem_id: ProblemId = pydantic.Field(alias="problemId")
    submission_id: SubmissionId = pydantic.Field(alias="submissionId")

    @pydantic.validator("problem_id")
    def _validate_problem_id(cls, problem_id: ProblemId) -> ProblemId:
        for validator in CustomTestCasesUnsupported.Validators._problem_id:
            problem_id = validator(problem_id)
        return problem_id

    @pydantic.validator("submission_id")
    def _validate_submission_id(cls, submission_id: SubmissionId) -> SubmissionId:
        for validator in CustomTestCasesUnsupported.Validators._submission_id:
            submission_id = validator(submission_id)
        return submission_id

    class Validators:
        _problem_id: typing.ClassVar[typing.List[typing.Callable[[ProblemId], ProblemId]]] = []
        _submission_id: typing.ClassVar[typing.List[typing.Callable[[SubmissionId], SubmissionId]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["problem_id"]
        ) -> typing.Callable[[typing.Callable[[ProblemId], ProblemId]], typing.Callable[[ProblemId], ProblemId]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["submission_id"]
        ) -> typing.Callable[
            [typing.Callable[[SubmissionId], SubmissionId]], typing.Callable[[SubmissionId], SubmissionId]
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "problem_id":
                    cls._problem_id.append(validator)
                elif field_name == "submission_id":
                    cls._submission_id.append(validator)
                else:
                    raise RuntimeError("Field does not exist on CustomTestCasesUnsupported: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
