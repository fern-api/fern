from pydantic import BaseModel
from typing import Optional
from resources.submission.types.exception_v_2 import ExceptionV2
from resources.submission.types.exception_info import ExceptionInfo


class WorkspaceRunDetails(BaseModel):
    exception_v_2: Optional[ExceptionV2] = Field(alias="exceptionV2", default=None)
    exception: Optional[ExceptionInfo] = None
    stdout: str
