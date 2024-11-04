from pydantic import BaseModel
from resources.submission.types.workspace_submission_status import (
    WorkspaceSubmissionStatus,
)


class WorkspaceSubmissionState(BaseModel):
    status: WorkspaceSubmissionStatus
