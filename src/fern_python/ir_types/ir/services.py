from pydantic import BaseModel
from typing import List, Any


class Services(BaseModel):
    http: List[Any]
    websocket: List[Any]
