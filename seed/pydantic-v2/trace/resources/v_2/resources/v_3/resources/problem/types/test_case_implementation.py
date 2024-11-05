from pydantic import BaseModel
from resources.v_2.resources.v_3.resources.problem.types.test_case_implementation_description import TestCaseImplementationDescription
from resources.v_2.resources.v_3.resources.problem.types.test_case_function import TestCaseFunction
from dt import datetime
from core.datetime_utils import serialize_datetime
class TestCaseImplementation(BaseModel):
    description: TestCaseImplementationDescription
    function: TestCaseFunction
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

