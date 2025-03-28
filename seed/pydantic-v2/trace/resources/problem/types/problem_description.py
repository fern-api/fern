from typing import List

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.problem.types.problem_description_board import ProblemDescriptionBoard

from pydantic import BaseModel


class ProblemDescription(BaseModel):
    boards: List[ProblemDescriptionBoard]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
