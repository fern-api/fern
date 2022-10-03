import typing

import pydantic

from .test_case_function import TestCaseFunction
from .test_case_implementation_description import TestCaseImplementationDescription


class TestCaseImplementation(pydantic.BaseModel):
    description: TestCaseImplementationDescription
    function: TestCaseFunction

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)
