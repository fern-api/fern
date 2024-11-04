from pydantic import BaseModel
from uuid import UUID
from resources.submission.types import ErrorInfo


class ErroredResponse(BaseModel):
    submission_id: UUID
    error_info: ErrorInfo
