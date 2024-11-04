from pydantic import BaseModel
from typing import List
from resources.submission.types.scope import Scope


class StackFrame(BaseModel):
    method_name: str = Field(alias="methodName")
    line_number: int = Field(alias="lineNumber")
    scopes: List[Scope]
