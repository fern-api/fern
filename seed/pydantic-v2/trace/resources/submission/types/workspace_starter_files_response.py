from pydantic import BaseModel
from typing import Dict
from resources.commons.types.language import Language
from resources.submission.types.workspace_files import WorkspaceFiles


class WorkspaceStarterFilesResponse(BaseModel):
    files: Dict[Language, WorkspaceFiles]
