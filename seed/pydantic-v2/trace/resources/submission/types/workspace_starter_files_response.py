from pydantic import BaseModel
from typing import Dict
from resources.commons.types import Language
from resources.submission.types import WorkspaceFiles


class WorkspaceStarterFilesResponse(BaseModel):
    files: Dict[Language, WorkspaceFiles]
