from pydantic import BaseModel
from typing import List
from resources.v_2.resources.v_3.resources.problem.types import (
    TestCaseImplementationDescriptionBoard,
)


class TestCaseImplementationDescription(BaseModel):
    boards: List[TestCaseImplementationDescriptionBoard]
