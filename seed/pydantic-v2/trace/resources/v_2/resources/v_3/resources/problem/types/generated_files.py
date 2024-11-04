from pydantic import BaseModel
from typing import Dict
from resources.commons.types.language import Language
from resources.v_2.resources.v_3.resources.problem.types.files import Files


class GeneratedFiles(BaseModel):
    generated_test_case_files: Dict[Language, Files] = Field(
        alias="generatedTestCaseFiles"
    )
    generated_template_files: Dict[Language, Files] = Field(
        alias="generatedTemplateFiles"
    )
    other: Dict[Language, Files]
