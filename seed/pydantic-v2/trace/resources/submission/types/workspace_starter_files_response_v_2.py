from pydantic import BaseModel
from typing import Dict
from resources.commons.types.language import Language
from resources.v_2.resources.problem.types.files import Files


class WorkspaceStarterFilesResponseV2(BaseModel):
    files_by_language: Dict[Language, Files] = Field(alias="filesByLanguage")
