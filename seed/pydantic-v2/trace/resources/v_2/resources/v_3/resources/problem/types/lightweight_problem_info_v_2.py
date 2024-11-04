from pydantic import BaseModel
from typing import Set
from resources.commons.types.variable_type import VariableType


class LightweightProblemInfoV2(BaseModel):
    problem_id: str = Field(alias="problemId")
    problem_name: str = Field(alias="problemName")
    problem_version: int = Field(alias="problemVersion")
    variable_types: Set[VariableType] = Field(alias="variableTypes")
