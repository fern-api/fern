import typing

import pydantic

from .workspace_submission_update import WorkspaceSubmissionUpdate


class WorkspaceSubmissionStatusV2(pydantic.BaseModel):
    updates: typing.List[WorkspaceSubmissionUpdate]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
