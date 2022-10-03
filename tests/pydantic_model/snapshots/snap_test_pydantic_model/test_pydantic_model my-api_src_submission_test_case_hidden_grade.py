import pydantic


class TestCaseHiddenGrade(pydantic.BaseModel):
    passed: bool
