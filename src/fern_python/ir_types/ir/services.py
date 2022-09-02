from pydantic import BaseModel
from typing import List, Any
from .. import services


class Services(BaseModel):
    http: List[services.HttpService]
    websocket: List[Any]
