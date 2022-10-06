import typing

import pydantic
import typing_extensions

from .execution_session_status import ExecutionSessionStatus
from .submission_id import SubmissionId


class BuildingExecutorResponse(pydantic.BaseModel):
    submission_id: SubmissionId = pydantic.Field(alias="submissionId")
    status: ExecutionSessionStatus

    @pydantic.validator("submission_id")
    def _validate_submission_id(cls, submission_id: SubmissionId) -> SubmissionId:
        for validator in BuildingExecutorResponse.Validators._submission_id:
            submission_id = validator(submission_id)
        return submission_id

    @pydantic.validator("status")
    def _validate_status(cls, status: ExecutionSessionStatus) -> ExecutionSessionStatus:
        for validator in BuildingExecutorResponse.Validators._status:
            status = validator(status)
        return status

    class Validators:
        _submission_id: typing.ClassVar[SubmissionId] = []
        _status: typing.ClassVar[ExecutionSessionStatus] = []

        @typing.overload
        @classmethod
        def field(submission_id: typing_extensions.Literal["submission_id"]) -> SubmissionId:
            ...

        @typing.overload
        @classmethod
        def field(status: typing_extensions.Literal["status"]) -> ExecutionSessionStatus:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "submission_id":
                    cls._submission_id.append(validator)  # type: ignore
                elif field_name == "status":
                    cls._status.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on BuildingExecutorResponse: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
