from pydantic import BaseModel
from resources.v_2.resources.problem.types.file_info_v_2 import FileInfoV2
from typing import List
from resources.commons.types.variable_type import VariableType
from dt import datetime
from core.datetime_utils import serialize_datetime
class DefaultProvidedFile(BaseModel):
    file: FileInfoV2
    related_types: List[VariableType] = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

