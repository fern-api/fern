import typing

import pydantic

from ....commons.problem_id import ProblemId
from ....commons.variable_type import VariableType


class LightweightProblemInfoV2(pydantic.BaseModel):
    problem_id: ProblemId = pydantic.Field(alias="problemId")
    problem_name: str = pydantic.Field(alias="problemName")
    problem_version: int = pydantic.Field(alias="problemVersion")
    variable_types: typing.List[VariableType] = pydantic.Field(alias="variableTypes")

    class Config:
        allow_population_by_field_name = True
