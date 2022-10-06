import typing

import pydantic

from .test_case_id import TestCaseId


class TestCaseMetadata(pydantic.BaseModel):
    id: TestCaseId
    name: str
    hidden: bool

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
