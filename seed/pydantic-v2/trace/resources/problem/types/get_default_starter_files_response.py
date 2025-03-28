from typing import Dict

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.commons.types.language import Language
from resources.problem.types.problem_files import ProblemFiles

from pydantic import BaseModel


class GetDefaultStarterFilesResponse(BaseModel):
    files: Dict[Language, ProblemFiles]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
