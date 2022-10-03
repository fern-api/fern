import pydantic


class TestCaseId(pydantic.BaseModel):
    __root__: str
