from pydantic import BaseModel
from typing import Set
from resources.commons.types import VariableType


class LightweightProblemInfoV2(BaseModel):
    problem_id: str
    problem_name: str
    problem_version: int
    variable_types: Set[VariableType]
