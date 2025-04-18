from pydantic import BaseModel
from typing import Optional, List
from resources.types.types.node import Node
from resources.types.types.tree import Tree
from dt import datetime
from core.datetime_utils import serialize_datetime


class Node(BaseModel):
    name: str
    nodes: Optional[List[Node]] = None
    trees: Optional[List[Tree]] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
