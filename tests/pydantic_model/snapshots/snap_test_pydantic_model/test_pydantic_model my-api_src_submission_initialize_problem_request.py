import typing

import pydantic

from ..commons.problem_id import ProblemId


class InitializeProblemRequest(pydantic.BaseModel):
    problem_id: ProblemId = pydantic.Field(alias="problemId")
    problem_version: typing.Optional[int] = pydantic.Field(alias="problemVersion")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
