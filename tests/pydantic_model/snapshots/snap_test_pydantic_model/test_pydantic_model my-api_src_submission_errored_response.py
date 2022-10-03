import pydantic

from .error_info import ErrorInfo
from .submission_id import SubmissionId


class ErroredResponse(pydantic.BaseModel):
    submission_id: SubmissionId = pydantic.Field(alias="submissionId")
    error_info: ErrorInfo = pydantic.Field(alias="errorInfo")

    class Config:
        allow_population_by_field_name = True
