from pydantic import BaseModel
from typing import Any


class LangServerResponse(BaseModel):
    response: Any
