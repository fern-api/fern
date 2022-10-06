import typing

import pydantic

from .workspace_submission_status import WorkspaceSubmissionStatus


class WorkspaceSubmissionState(pydantic.BaseModel):
    status: WorkspaceSubmissionStatus

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
