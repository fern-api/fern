from pydantic import BaseModel
from uuid import UUID
from resources.submission.types import WorkspaceRunDetails


class WorkspaceRanResponse(BaseModel):
    submission_id: UUID
    run_details: WorkspaceRunDetails
