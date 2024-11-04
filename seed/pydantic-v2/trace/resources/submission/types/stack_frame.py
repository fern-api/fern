from pydantic import BaseModel
from typing import List
from resources.submission.types import Scope


class StackFrame(BaseModel):
    method_name: str
    line_number: int
    scopes: List[Scope]
