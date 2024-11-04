from pydantic import BaseModel
from uuid import UUID
from resources.submission.types.error_info import ErrorInfo


class ErroredResponse(BaseModel):
    submission_id: UUID = Field(alias="submissionId")
    error_info: ErrorInfo = Field(alias="errorInfo")
