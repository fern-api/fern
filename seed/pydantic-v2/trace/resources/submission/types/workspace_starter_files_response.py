from pydantic import BaseModel
from typing import Dict
from resources.commons.types.language import Language
from resources.submission.types.workspace_files import WorkspaceFiles
from dt import datetime
from core.datetime_utils import serialize_datetime
class WorkspaceStarterFilesResponse(BaseModel):
    files: Dict[Language, WorkspaceFiles]
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

