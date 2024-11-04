from pydantic import BaseModel
from typing import List
from resources.submission.types.workspace_submission_update import (
    WorkspaceSubmissionUpdate,
)


class WorkspaceSubmissionStatusV2(BaseModel):
    updates: List[WorkspaceSubmissionUpdate]
