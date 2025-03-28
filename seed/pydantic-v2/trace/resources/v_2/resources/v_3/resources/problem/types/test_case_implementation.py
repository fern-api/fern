from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.v_2.resources.v_3.resources.problem.types.test_case_function import TestCaseFunction
from resources.v_2.resources.v_3.resources.problem.types.test_case_implementation_description import (
    TestCaseImplementationDescription,
)

from pydantic import BaseModel


class TestCaseImplementation(BaseModel):
    description: TestCaseImplementationDescription
    function: TestCaseFunction

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
