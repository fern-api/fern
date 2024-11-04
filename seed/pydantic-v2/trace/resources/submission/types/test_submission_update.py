from pydantic import BaseModel
from datetime import datetime
from resources.submission.types import TestSubmissionUpdateInfo


class TestSubmissionUpdate(BaseModel):
    update_time: datetime
    update_info: TestSubmissionUpdateInfo
