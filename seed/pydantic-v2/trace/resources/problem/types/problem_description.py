from pydantic import BaseModel
from typing import List
from resources.problem.types.problem_description_board import ProblemDescriptionBoard


class ProblemDescription(BaseModel):
    boards: List[ProblemDescriptionBoard]
