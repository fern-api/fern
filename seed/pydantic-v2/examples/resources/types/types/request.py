from pydantic import BaseModel
from typing import Any


class Request(BaseModel):
    request: Any
