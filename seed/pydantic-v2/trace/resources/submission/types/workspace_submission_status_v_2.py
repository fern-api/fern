from typing import List

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.submission.types.workspace_submission_update import WorkspaceSubmissionUpdate

from pydantic import BaseModel


class WorkspaceSubmissionStatusV2(BaseModel):
    updates: List[WorkspaceSubmissionUpdate]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
