from pydantic import BaseModel
from resources.v_2.resources.problem.types import TestCaseImplementationDescription


class BasicTestCaseTemplate(BaseModel):
    template_id: str
    name: str
    description: TestCaseImplementationDescription
    expected_value_parameter_id: str
