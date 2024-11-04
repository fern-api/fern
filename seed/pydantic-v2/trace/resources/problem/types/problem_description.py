from pydantic import BaseModel
from typing import List
from resources.problem.types import ProblemDescriptionBoard


class ProblemDescription(BaseModel):
    boards: List[ProblemDescriptionBoard]
