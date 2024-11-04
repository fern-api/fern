from pydantic import BaseModel
from typing import List
from resources.v_2.resources.problem.types.test_case_implementation_description_board import TestCaseImplementationDescriptionBoard
from dt import datetime
from core.datetime_utils import serialize_datetime
class TestCaseImplementationDescription(BaseModel):
    boards: List[TestCaseImplementationDescriptionBoard]
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

