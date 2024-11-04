from pydantic import BaseModel
from resources.v_2.resources.problem.types.test_case_implementation_description import (
    TestCaseImplementationDescription,
)


class BasicTestCaseTemplate(BaseModel):
    template_id: str = Field(alias="templateId")
    name: str
    description: TestCaseImplementationDescription
    expected_value_parameter_id: str = Field(alias="expectedValueParameterId")
