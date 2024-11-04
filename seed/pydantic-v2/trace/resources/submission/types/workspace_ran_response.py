from pydantic import BaseModel
from uuid import UUID
from resources.submission.types.workspace_run_details import WorkspaceRunDetails


class WorkspaceRanResponse(BaseModel):
    submission_id: UUID = Field(alias="submissionId")
    run_details: WorkspaceRunDetails = Field(alias="runDetails")
