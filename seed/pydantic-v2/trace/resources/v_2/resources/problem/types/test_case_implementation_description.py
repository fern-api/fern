from pydantic import BaseModel
from typing import List
from resources.v_2.resources.problem.types.test_case_implementation_description_board import (
    TestCaseImplementationDescriptionBoard,
)


class TestCaseImplementationDescription(BaseModel):
    boards: List[TestCaseImplementationDescriptionBoard]
