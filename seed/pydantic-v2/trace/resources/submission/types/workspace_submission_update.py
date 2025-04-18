from pydantic import BaseModel
from datetime import datetime
from resources.submission.types.workspace_submission_update_info import WorkspaceSubmissionUpdateInfo
from dt import datetime
from core.datetime_utils import serialize_datetime
class WorkspaceSubmissionUpdate(BaseModel):
    update_time: datetime = 
    update_info: WorkspaceSubmissionUpdateInfo = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

