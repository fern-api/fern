import typing

import pydantic

from .test_case_result import TestCaseResult


class TestCaseResultWithStdout(pydantic.BaseModel):
    result: TestCaseResult
    stdout: str

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
