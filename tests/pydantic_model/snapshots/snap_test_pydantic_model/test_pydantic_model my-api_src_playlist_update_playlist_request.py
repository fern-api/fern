import typing

import pydantic

from ..commons.problem_id import ProblemId


class UpdatePlaylistRequest(pydantic.BaseModel):
    name: str
    problems: typing.List[ProblemId]
