import typing

import pydantic

from .test_case_template import TestCaseTemplate
from .test_case_v2 import TestCaseV2


class GetGeneratedTestCaseFileRequest(pydantic.BaseModel):
    template: typing.Optional[TestCaseTemplate]
    test_case: TestCaseV2 = pydantic.Field(alias="testCase")

    class Config:
        allow_population_by_field_name = True
