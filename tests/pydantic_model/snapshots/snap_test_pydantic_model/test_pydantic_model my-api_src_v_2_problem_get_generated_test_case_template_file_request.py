import typing

import pydantic

from .test_case_template import TestCaseTemplate


class GetGeneratedTestCaseTemplateFileRequest(pydantic.BaseModel):
    template: TestCaseTemplate

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)
