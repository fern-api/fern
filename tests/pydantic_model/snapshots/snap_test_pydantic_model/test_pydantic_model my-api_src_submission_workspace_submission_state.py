import typing

import pydantic
import typing_extensions

from .workspace_submission_status import WorkspaceSubmissionStatus


class WorkspaceSubmissionState(pydantic.BaseModel):
    status: WorkspaceSubmissionStatus

    @pydantic.validator("status")
    def _validate_status(cls, status: WorkspaceSubmissionStatus) -> WorkspaceSubmissionStatus:
        for validator in WorkspaceSubmissionState.Validators._status:
            status = validator(status)
        return status

    class Validators:
        _status: typing.ClassVar[WorkspaceSubmissionStatus] = []

        @typing.overload
        @classmethod
        def field(status: typing_extensions.Literal["status"]) -> WorkspaceSubmissionStatus:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "status":
                    cls._status.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on WorkspaceSubmissionState: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
