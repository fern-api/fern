from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.v_2.resources.v_3.resources.problem.types.test_case_template import TestCaseTemplate

from pydantic import BaseModel


class GetGeneratedTestCaseTemplateFileRequest(BaseModel):
    template: TestCaseTemplate

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
