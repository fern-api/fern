from pydantic import BaseModel
from uuid import UUID
from resources.submission.types.traced_file import TracedFile
from typing import Optional
from resources.commons.types.debug_variable_value import DebugVariableValue
from resources.submission.types.expression_location import ExpressionLocation
from resources.submission.types.stack_information import StackInformation
from dt import datetime
from core.datetime_utils import serialize_datetime
class TraceResponseV2(BaseModel):
    submission_id: UUID = 
    line_number: int = 
    file: TracedFile
    return_value: Optional[DebugVariableValue] = 
    expression_location: Optional[ExpressionLocation] = 
    stack: StackInformation
    stdout: Optional[str] = None
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

