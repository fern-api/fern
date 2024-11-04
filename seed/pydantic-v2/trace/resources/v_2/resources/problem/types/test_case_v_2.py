from pydantic import BaseModel
from resources.v_2.resources.problem.types import (
    TestCaseMetadata,
    TestCaseImplementationReference,
    TestCaseExpects,
)
from typing import Dict, Optional
from resources.commons.types import VariableValue


class TestCaseV2(BaseModel):
    metadata: TestCaseMetadata
    implementation: TestCaseImplementationReference
    arguments: Dict[str, VariableValue]
    expects: Optional[TestCaseExpects] = None
