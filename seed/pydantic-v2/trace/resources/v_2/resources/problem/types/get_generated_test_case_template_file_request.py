from pydantic import BaseModel
from resources.v_2.resources.problem.types.test_case_template import TestCaseTemplate


class GetGeneratedTestCaseTemplateFileRequest(BaseModel):
    template: TestCaseTemplate
