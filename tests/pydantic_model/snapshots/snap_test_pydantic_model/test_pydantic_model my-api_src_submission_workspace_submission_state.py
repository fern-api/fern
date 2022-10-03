import pydantic

from .workspace_submission_status import WorkspaceSubmissionStatus


class WorkspaceSubmissionState(pydantic.BaseModel):
    status: WorkspaceSubmissionStatus
