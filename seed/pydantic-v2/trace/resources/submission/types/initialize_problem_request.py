from pydantic import BaseModel
from typing import Optional


class InitializeProblemRequest(BaseModel):
    problem_id: str
    problem_version: Optional[int] = None
