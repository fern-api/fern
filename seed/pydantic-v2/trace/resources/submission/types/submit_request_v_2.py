from pydantic import BaseModel
from uuid import UUID
from resources.commons.types.language import Language
from typing import List, Optional
from resources.submission.types.submission_file_info import SubmissionFileInfo


class SubmitRequestV2(BaseModel):
    submission_id: UUID = Field(alias="submissionId")
    language: Language
    submission_files: List[SubmissionFileInfo] = Field(alias="submissionFiles")
    problem_id: str = Field(alias="problemId")
    problem_version: Optional[int] = Field(alias="problemVersion", default=None)
    user_id: Optional[str] = Field(alias="userId", default=None)
