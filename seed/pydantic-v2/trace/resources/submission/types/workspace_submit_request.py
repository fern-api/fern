from pydantic import BaseModel
from uuid import UUID
from resources.commons.types.language import Language
from typing import List, Optional
from resources.submission.types.submission_file_info import SubmissionFileInfo


class WorkspaceSubmitRequest(BaseModel):
    submission_id: UUID = Field(alias="submissionId")
    language: Language
    submission_files: List[SubmissionFileInfo] = Field(alias="submissionFiles")
    user_id: Optional[str] = Field(alias="userId", default=None)
