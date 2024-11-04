from pydantic import BaseModel


class TestCaseHiddenGrade(BaseModel):
    passed: bool
