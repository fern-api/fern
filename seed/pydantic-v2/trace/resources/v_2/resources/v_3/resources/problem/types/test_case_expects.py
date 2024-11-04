from pydantic import BaseModel
from typing import Optional


class TestCaseExpects(BaseModel):
    expected_stdout: Optional[str] = Field(alias="expectedStdout", default=None)
