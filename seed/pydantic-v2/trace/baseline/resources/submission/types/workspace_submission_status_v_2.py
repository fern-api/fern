from pydantic import BaseModel
from typing import List
from resources.submission.types.workspace_submission_update import WorkspaceSubmissionUpdate
from dt import datetime
from core.datetime_utils import serialize_datetime
class WorkspaceSubmissionStatusV2(BaseModel):
    updates: List[WorkspaceSubmissionUpdate]
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

