from pydantic import BaseModel
from typing import Optional


class TestCaseExpects(BaseModel):
    expected_stdout: Optional[str] = None
