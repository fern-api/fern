import typing

import pydantic

from .parameter_id import ParameterId
from .test_case_implementation_description import TestCaseImplementationDescription
from .test_case_template_id import TestCaseTemplateId


class BasicTestCaseTemplate(pydantic.BaseModel):
    template_id: TestCaseTemplateId = pydantic.Field(alias="templateId")
    name: str
    description: TestCaseImplementationDescription
    expected_value_parameter_id: ParameterId = pydantic.Field(alias="expectedValueParameterId")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
