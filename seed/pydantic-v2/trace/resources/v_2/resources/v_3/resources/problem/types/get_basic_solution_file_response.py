from pydantic import BaseModel
from typing import Dict
from resources.commons.types.language import Language
from resources.v_2.resources.v_3.resources.problem.types.file_info_v_2 import FileInfoV2


class GetBasicSolutionFileResponse(BaseModel):
    solution_file_by_language: Dict[Language, FileInfoV2] = Field(
        alias="solutionFileByLanguage"
    )
