from pydantic import BaseModel
from typing import Dict
from resources.commons.types import Language
from resources.v_2.resources.problem.types import Files


class GeneratedFiles(BaseModel):
    generated_test_case_files: Dict[Language, Files]
    generated_template_files: Dict[Language, Files]
    other: Dict[Language, Files]
