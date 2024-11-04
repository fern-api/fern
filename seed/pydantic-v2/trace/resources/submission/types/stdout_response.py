from pydantic import BaseModel
from uuid import UUID


class StdoutResponse(BaseModel):
    submission_id: UUID
    stdout: str
