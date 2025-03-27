from typing import Dict, Optional

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.commons.types.variable_value import VariableValue
from resources.v_2.resources.problem.types.test_case_expects import TestCaseExpects
from resources.v_2.resources.problem.types.test_case_implementation_reference import TestCaseImplementationReference
from resources.v_2.resources.problem.types.test_case_metadata import TestCaseMetadata

from pydantic import BaseModel


class TestCaseV2(BaseModel):
    metadata: TestCaseMetadata
    implementation: TestCaseImplementationReference
    arguments: Dict[str, VariableValue]
    expects: Optional[TestCaseExpects] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
