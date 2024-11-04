from pydantic import BaseModel
from resources.v_2.resources.problem.types.non_void_function_signature import NonVoidFunctionSignature
from typing import Dict
from resources.commons.types.language import Language
from resources.v_2.resources.problem.types.files import Files
from resources.v_2.resources.problem.types.basic_test_case_template import BasicTestCaseTemplate
from dt import datetime
from core.datetime_utils import serialize_datetime
class BasicCustomFiles(BaseModel):
    method_name: str = 
    signature: NonVoidFunctionSignature
    additional_files: Dict[Language, Files] = 
    basic_test_case_template: BasicTestCaseTemplate = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

