from pydantic import BaseModel
from typing import Any


class LangServerRequest(BaseModel):
    request: Any
