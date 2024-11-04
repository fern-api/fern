from pydantic import BaseModel
from uuid import UUID


class CustomTestCasesUnsupported(BaseModel):
    problem_id: str = Field(alias="problemId")
    submission_id: UUID = Field(alias="submissionId")
