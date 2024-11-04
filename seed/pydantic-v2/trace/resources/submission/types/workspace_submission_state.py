from pydantic import BaseModel
from resources.submission.types import WorkspaceSubmissionStatus


class WorkspaceSubmissionState(BaseModel):
    status: WorkspaceSubmissionStatus
