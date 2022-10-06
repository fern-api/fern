import typing

import pydantic

from .test_case_implementation import TestCaseImplementation
from .test_case_template_id import TestCaseTemplateId


class TestCaseTemplate(pydantic.BaseModel):
    template_id: TestCaseTemplateId = pydantic.Field(alias="templateId")
    name: str
    implementation: TestCaseImplementation

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
