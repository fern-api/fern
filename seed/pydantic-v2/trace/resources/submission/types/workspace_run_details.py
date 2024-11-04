from pydantic import BaseModel
from typing import Optional
from resources.submission.types import ExceptionV2, ExceptionInfo


class WorkspaceRunDetails(BaseModel):
    exception_v_2: Optional[ExceptionV2] = None
    exception: Optional[ExceptionInfo] = None
    stdout: str
