from pydantic import BaseModel
from resources.submission.types import ExceptionInfo


class InternalError(BaseModel):
    exception_info: ExceptionInfo
