from pydantic import BaseModel
from uuid import UUID
from resources.submission.types import TracedFile, ExpressionLocation, StackInformation
from typing import Optional
from resources.commons.types import DebugVariableValue


class TraceResponseV2(BaseModel):
    submission_id: UUID
    line_number: int
    file: TracedFile
    return_value: Optional[DebugVariableValue] = None
    expression_location: Optional[ExpressionLocation] = None
    stack: StackInformation
    stdout: Optional[str] = None
