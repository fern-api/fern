from pydantic import BaseModel
from typing import List
from resources.problem.types.problem_description_board import ProblemDescriptionBoard
from dt import datetime
from core.datetime_utils import serialize_datetime
class ProblemDescription(BaseModel):
    boards: List[ProblemDescriptionBoard]
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

