import typing

import pydantic
import typing_extensions

from .submission_id import SubmissionId
from .workspace_run_details import WorkspaceRunDetails


class WorkspaceRanResponse(pydantic.BaseModel):
    submission_id: SubmissionId = pydantic.Field(alias="submissionId")
    run_details: WorkspaceRunDetails = pydantic.Field(alias="runDetails")

    @pydantic.validator("submission_id")
    def _validate_submission_id(cls, submission_id: SubmissionId) -> SubmissionId:
        for validator in WorkspaceRanResponse.Validators._submission_id:
            submission_id = validator(submission_id)
        return submission_id

    @pydantic.validator("run_details")
    def _validate_run_details(cls, run_details: WorkspaceRunDetails) -> WorkspaceRunDetails:
        for validator in WorkspaceRanResponse.Validators._run_details:
            run_details = validator(run_details)
        return run_details

    class Validators:
        _submission_id: typing.ClassVar[SubmissionId] = []
        _run_details: typing.ClassVar[WorkspaceRunDetails] = []

        @typing.overload
        @classmethod
        def field(submission_id: typing_extensions.Literal["submission_id"]) -> SubmissionId:
            ...

        @typing.overload
        @classmethod
        def field(run_details: typing_extensions.Literal["run_details"]) -> WorkspaceRunDetails:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "submission_id":
                    cls._submission_id.append(validator)  # type: ignore
                elif field_name == "run_details":
                    cls._run_details.append(validator)  # type: ignore
                else:
                    raise RuntimeError("Field does not exist on WorkspaceRanResponse: " + field_name)

                return validator

            return validator  # type: ignore

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
