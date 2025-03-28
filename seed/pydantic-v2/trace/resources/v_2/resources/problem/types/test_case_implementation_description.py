from typing import List

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.v_2.resources.problem.types.test_case_implementation_description_board import (
    TestCaseImplementationDescriptionBoard,
)

from pydantic import BaseModel


class TestCaseImplementationDescription(BaseModel):
    boards: List[TestCaseImplementationDescriptionBoard]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
