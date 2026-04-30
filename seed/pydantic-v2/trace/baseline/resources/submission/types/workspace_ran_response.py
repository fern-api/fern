from pydantic import BaseModel
from uuid import UUID
from resources.submission.types.workspace_run_details import WorkspaceRunDetails
from dt import datetime
from core.datetime_utils import serialize_datetime
class WorkspaceRanResponse(BaseModel):
    submission_id: UUID = 
    run_details: WorkspaceRunDetails = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

