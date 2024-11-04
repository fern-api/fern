from pydantic import BaseModel
from typing import Optional
from resources.v_2.resources.problem.types import TestCaseTemplate, TestCaseV2


class GetGeneratedTestCaseFileRequest(BaseModel):
    template: Optional[TestCaseTemplate] = None
    test_case: TestCaseV2
