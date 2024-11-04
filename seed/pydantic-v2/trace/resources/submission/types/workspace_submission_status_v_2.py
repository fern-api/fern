from pydantic import BaseModel
from typing import List
from resources.submission.types import WorkspaceSubmissionUpdate


class WorkspaceSubmissionStatusV2(BaseModel):
    updates: List[WorkspaceSubmissionUpdate]
