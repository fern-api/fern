from pydantic import BaseModel
from uuid import UUID
from typing import Optional


class RecordedResponseNotification(BaseModel):
    submission_id: UUID
    trace_responses_size: int
    test_case_id: Optional[str] = None
