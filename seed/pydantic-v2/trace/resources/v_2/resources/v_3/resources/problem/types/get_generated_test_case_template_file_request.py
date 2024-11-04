from pydantic import BaseModel
from resources.v_2.resources.v_3.resources.problem.types import TestCaseTemplate


class GetGeneratedTestCaseTemplateFileRequest(BaseModel):
    template: TestCaseTemplate
