from pydantic import BaseModel
from resources.v_2.resources.problem.types.test_case_template import TestCaseTemplate
from dt import datetime
from core.datetime_utils import serialize_datetime
class GetGeneratedTestCaseTemplateFileRequest(BaseModel):
    template: TestCaseTemplate
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

