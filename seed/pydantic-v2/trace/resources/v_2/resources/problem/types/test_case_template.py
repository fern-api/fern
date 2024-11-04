from pydantic import BaseModel
from resources.v_2.resources.problem.types import TestCaseImplementation


class TestCaseTemplate(BaseModel):
    template_id: str
    name: str
    implementation: TestCaseImplementation
