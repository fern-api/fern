from pydantic import BaseModel
from typing import Dict
from resources.commons.types import Language
from resources.problem.types import ProblemFiles


class GetDefaultStarterFilesResponse(BaseModel):
    files: Dict[Language, ProblemFiles]
