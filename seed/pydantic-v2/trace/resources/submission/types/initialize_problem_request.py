from pydantic import BaseModel
from typing import Optional


class InitializeProblemRequest(BaseModel):
    problem_id: str = Field(alias="problemId")
    problem_version: Optional[int] = Field(alias="problemVersion", default=None)
