from pydantic import BaseModel


class UpdateProblemResponse(BaseModel):
    problem_version: int
