from pydantic import BaseModel
from typing import Dict
from resources.commons.types.language import Language
from resources.problem.types.problem_files import ProblemFiles
from dt import datetime
from core.datetime_utils import serialize_datetime
class GetDefaultStarterFilesResponse(BaseModel):
    files: Dict[Language, ProblemFiles]
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

