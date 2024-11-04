from pydantic import BaseModel
from uuid import UUID


class CustomTestCasesUnsupported(BaseModel):
    problem_id: str
    submission_id: UUID
