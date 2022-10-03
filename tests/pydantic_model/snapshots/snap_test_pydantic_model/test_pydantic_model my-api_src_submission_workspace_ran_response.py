import typing

import pydantic

from .submission_id import SubmissionId
from .workspace_run_details import WorkspaceRunDetails


class WorkspaceRanResponse(pydantic.BaseModel):
    submission_id: SubmissionId = pydantic.Field(alias="submissionId")
    run_details: WorkspaceRunDetails = pydantic.Field(alias="runDetails")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
