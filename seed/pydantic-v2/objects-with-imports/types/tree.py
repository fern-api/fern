from pydantic import BaseModel
from typing import Optional, List
from .types.node import Node
from dt import datetime
from core.datetime_utils import serialize_datetime


class Tree(BaseModel):
    nodes: Optional[List[Node]] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
