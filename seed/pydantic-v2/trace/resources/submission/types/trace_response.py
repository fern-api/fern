from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from resources.commons.types import DebugVariableValue
from resources.submission.types import ExpressionLocation, StackInformation


class TraceResponse(BaseModel):
    submission_id: UUID
    line_number: int
    return_value: Optional[DebugVariableValue] = None
    expression_location: Optional[ExpressionLocation] = None
    stack: StackInformation
    stdout: Optional[str] = None
