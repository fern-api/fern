from pydantic import BaseModel
from datetime import datetime
from resources.submission.types.test_submission_update_info import TestSubmissionUpdateInfo
from dt import datetime
from core.datetime_utils import serialize_datetime
class TestSubmissionUpdate(BaseModel):
    update_time: datetime = 
    update_info: TestSubmissionUpdateInfo = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

