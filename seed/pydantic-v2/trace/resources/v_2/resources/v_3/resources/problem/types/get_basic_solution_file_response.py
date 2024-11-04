from pydantic import BaseModel
from typing import Dict
from resources.commons.types import Language
from resources.v_2.resources.v_3.resources.problem.types import FileInfoV2


class GetBasicSolutionFileResponse(BaseModel):
    solution_file_by_language: Dict[Language, FileInfoV2]
