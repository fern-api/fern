from pydantic import BaseModel
from typing import Dict
from resources.commons.types import Language
from resources.v_2.resources.problem.types import Files


class WorkspaceStarterFilesResponseV2(BaseModel):
    files_by_language: Dict[Language, Files]
