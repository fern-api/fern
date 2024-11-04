from pydantic import BaseModel
from uuid import UUID
from typing import Optional


class RecordedResponseNotification(BaseModel):
    submission_id: UUID = Field(alias="submissionId")
    trace_responses_size: int = Field(alias="traceResponsesSize")
    test_case_id: Optional[str] = Field(alias="testCaseId", default=None)
