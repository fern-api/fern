from pydantic import BaseModel
from resources.v_2.resources.v_3.resources.problem.types.test_case_metadata import TestCaseMetadata
from resources.v_2.resources.v_3.resources.problem.types.test_case_implementation_reference import TestCaseImplementationReference
from typing import Dict, Optional
from resources.commons.types.variable_value import VariableValue
from resources.v_2.resources.v_3.resources.problem.types.test_case_expects import TestCaseExpects
from dt import datetime
from core.datetime_utils import serialize_datetime
class TestCaseV2(BaseModel):
    metadata: TestCaseMetadata
    implementation: TestCaseImplementationReference
    arguments: Dict[str, VariableValue]
    expects: Optional[TestCaseExpects] = None
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

