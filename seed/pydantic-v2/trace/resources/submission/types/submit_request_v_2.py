from pydantic import BaseModel
from uuid import UUID
from resources.commons.types import Language
from typing import List, Optional
from resources.submission.types import SubmissionFileInfo


class SubmitRequestV2(BaseModel):
    submission_id: UUID
    language: Language
    submission_files: List[SubmissionFileInfo]
    problem_id: str
    problem_version: Optional[int] = None
    user_id: Optional[str] = None
