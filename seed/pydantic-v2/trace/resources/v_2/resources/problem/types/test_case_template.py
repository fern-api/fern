from pydantic import BaseModel
from resources.v_2.resources.problem.types.test_case_implementation import (
    TestCaseImplementation,
)


class TestCaseTemplate(BaseModel):
    template_id: str = Field(alias="templateId")
    name: str
    implementation: TestCaseImplementation
