from pydantic import BaseModel
from typing import List
from resources.v_2.resources.problem.types import TestCaseImplementationDescriptionBoard


class TestCaseImplementationDescription(BaseModel):
    boards: List[TestCaseImplementationDescriptionBoard]
