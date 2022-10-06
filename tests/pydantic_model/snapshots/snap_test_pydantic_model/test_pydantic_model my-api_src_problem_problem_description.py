import typing

import pydantic

from .problem_description_board import ProblemDescriptionBoard


class ProblemDescription(pydantic.BaseModel):
    boards: typing.List[ProblemDescriptionBoard]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
