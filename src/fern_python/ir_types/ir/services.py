from typing import Any, List

from pydantic import BaseModel

from .. import services


class Services(BaseModel):
    http: List[services.HttpService]
    websocket: List[Any]
