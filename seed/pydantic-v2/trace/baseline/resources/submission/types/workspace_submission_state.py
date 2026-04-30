from pydantic import BaseModel
from resources.submission.types.workspace_submission_status import WorkspaceSubmissionStatus
from dt import datetime
from core.datetime_utils import serialize_datetime
class WorkspaceSubmissionState(BaseModel):
    status: WorkspaceSubmissionStatus
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

