from typing import Dict

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.commons.types.language import Language
from resources.submission.types.workspace_files import WorkspaceFiles

from pydantic import BaseModel


class WorkspaceStarterFilesResponse(BaseModel):
    files: Dict[Language, WorkspaceFiles]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
