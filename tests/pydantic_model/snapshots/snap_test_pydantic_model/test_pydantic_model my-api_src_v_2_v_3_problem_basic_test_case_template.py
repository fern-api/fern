import pydantic

from .parameter_id import ParameterId
from .test_case_implementation_description import TestCaseImplementationDescription
from .test_case_template_id import TestCaseTemplateId


class BasicTestCaseTemplate(pydantic.BaseModel):
    template_id: TestCaseTemplateId = pydantic.Field(alias="templateId")
    name: str
    description: TestCaseImplementationDescription
    expected_value_parameter_id: ParameterId = pydantic.Field(alias="expectedValueParameterId")

    class Config:
        allow_population_by_field_name = True
