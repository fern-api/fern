from pydantic import BaseModel
from typing import Optional


class GetTraceResponsesPageRequest(BaseModel):
    offset: Optional[int] = None
