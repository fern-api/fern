from pydantic import BaseModel
from typing import Optional
from resources.v_2.resources.v_3.resources.problem.types.test_case_template import TestCaseTemplate
from resources.v_2.resources.v_3.resources.problem.types.test_case_v_2 import TestCaseV2
from dt import datetime
from core.datetime_utils import serialize_datetime
class GetGeneratedTestCaseFileRequest(BaseModel):
    template: Optional[TestCaseTemplate] = None
    test_case: TestCaseV2 = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

