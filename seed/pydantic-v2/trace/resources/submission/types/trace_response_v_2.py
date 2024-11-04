from pydantic import BaseModel
from uuid import UUID
from resources.submission.types.traced_file import TracedFile
from typing import Optional
from resources.commons.types.debug_variable_value import DebugVariableValue
from resources.submission.types.expression_location import ExpressionLocation
from resources.submission.types.stack_information import StackInformation


class TraceResponseV2(BaseModel):
    submission_id: UUID = Field(alias="submissionId")
    line_number: int = Field(alias="lineNumber")
    file: TracedFile
    return_value: Optional[DebugVariableValue] = Field(
        alias="returnValue", default=None
    )
    expression_location: Optional[ExpressionLocation] = Field(
        alias="expressionLocation", default=None
    )
    stack: StackInformation
    stdout: Optional[str] = None
