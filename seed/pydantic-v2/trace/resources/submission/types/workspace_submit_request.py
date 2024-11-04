from pydantic import BaseModel
from uuid import UUID
from resources.commons.types import Language
from typing import List, Optional
from resources.submission.types import SubmissionFileInfo


class WorkspaceSubmitRequest(BaseModel):
    submission_id: UUID
    language: Language
    submission_files: List[SubmissionFileInfo]
    user_id: Optional[str] = None
