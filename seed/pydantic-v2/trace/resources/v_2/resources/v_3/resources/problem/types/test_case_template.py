from pydantic import BaseModel
from resources.v_2.resources.v_3.resources.problem.types.test_case_implementation import TestCaseImplementation
from dt import datetime
from core.datetime_utils import serialize_datetime
class TestCaseTemplate(BaseModel):
    template_id: str = 
    name: str
    implementation: TestCaseImplementation
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

