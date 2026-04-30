from pydantic import BaseModel
from typing import Dict
from resources.commons.types.language import Language
from resources.v_2.resources.problem.types.files import Files
from dt import datetime
from core.datetime_utils import serialize_datetime
class WorkspaceStarterFilesResponseV2(BaseModel):
    files_by_language: Dict[Language, Files] = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

