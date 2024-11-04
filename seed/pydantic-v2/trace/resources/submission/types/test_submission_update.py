from pydantic import BaseModel
from datetime import datetime
from resources.submission.types.test_submission_update_info import (
    TestSubmissionUpdateInfo,
)


class TestSubmissionUpdate(BaseModel):
    update_time: datetime = Field(alias="updateTime")
    update_info: TestSubmissionUpdateInfo = Field(alias="updateInfo")
