from pydantic import BaseModel
from resources.v_2.resources.v_3.resources.problem.types.test_case_implementation_description import TestCaseImplementationDescription
from dt import datetime
from core.datetime_utils import serialize_datetime
class BasicTestCaseTemplate(BaseModel):
    template_id: str = 
    name: str
    description: TestCaseImplementationDescription
    expected_value_parameter_id: str = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

