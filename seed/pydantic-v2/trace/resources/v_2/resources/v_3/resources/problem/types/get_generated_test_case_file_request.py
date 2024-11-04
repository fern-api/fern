from pydantic import BaseModel
from typing import Optional
from resources.v_2.resources.v_3.resources.problem.types.test_case_template import (
    TestCaseTemplate,
)
from resources.v_2.resources.v_3.resources.problem.types.test_case_v_2 import TestCaseV2


class GetGeneratedTestCaseFileRequest(BaseModel):
    template: Optional[TestCaseTemplate] = None
    test_case: TestCaseV2 = Field(alias="testCase")
