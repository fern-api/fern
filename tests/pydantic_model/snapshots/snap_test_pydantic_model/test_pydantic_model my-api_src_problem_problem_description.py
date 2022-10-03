import typing

import pydantic

from .problem_description_board import ProblemDescriptionBoard


class ProblemDescription(pydantic.BaseModel):
    boards: typing.List[ProblemDescriptionBoard]
