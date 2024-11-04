from pydantic import BaseModel
from datetime import datetime
from resources.submission.types.workspace_submission_update_info import (
    WorkspaceSubmissionUpdateInfo,
)


class WorkspaceSubmissionUpdate(BaseModel):
    update_time: datetime = Field(alias="updateTime")
    update_info: WorkspaceSubmissionUpdateInfo = Field(alias="updateInfo")
