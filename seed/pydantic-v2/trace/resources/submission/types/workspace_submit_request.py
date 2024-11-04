from pydantic import BaseModel
from uuid import UUID
from resources.commons.types.language import Language
from typing import List, Optional
from resources.submission.types.submission_file_info import SubmissionFileInfo
from dt import datetime
from core.datetime_utils import serialize_datetime
class WorkspaceSubmitRequest(BaseModel):
    submission_id: UUID = 
    language: Language
    submission_files: List[SubmissionFileInfo] = 
    user_id: Optional[str] = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

