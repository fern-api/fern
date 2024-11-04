from pydantic import BaseModel
from datetime import datetime
from resources.submission.types import WorkspaceSubmissionUpdateInfo


class WorkspaceSubmissionUpdate(BaseModel):
    update_time: datetime
    update_info: WorkspaceSubmissionUpdateInfo
