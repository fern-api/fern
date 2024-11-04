from pydantic import BaseModel
from typing import Dict
from resources.commons.types.language import Language
from resources.problem.types.problem_files import ProblemFiles


class GetDefaultStarterFilesResponse(BaseModel):
    files: Dict[Language, ProblemFiles]
