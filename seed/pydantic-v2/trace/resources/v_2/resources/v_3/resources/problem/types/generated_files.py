from pydantic import BaseModel
from typing import Dict
from resources.commons.types.language import Language
from resources.v_2.resources.v_3.resources.problem.types.files import Files
from dt import datetime
from core.datetime_utils import serialize_datetime
class GeneratedFiles(BaseModel):
    generated_test_case_files: Dict[Language, Files] = 
    generated_template_files: Dict[Language, Files] = 
    other: Dict[Language, Files]
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

