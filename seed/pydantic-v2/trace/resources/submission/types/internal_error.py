from pydantic import BaseModel
from resources.submission.types.exception_info import ExceptionInfo


class InternalError(BaseModel):
    exception_info: ExceptionInfo = Field(alias="exceptionInfo")
