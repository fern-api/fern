import typing

import pydantic

from .workspace_submission_update import WorkspaceSubmissionUpdate


class WorkspaceSubmissionStatusV2(pydantic.BaseModel):
    updates: typing.List[WorkspaceSubmissionUpdate]
