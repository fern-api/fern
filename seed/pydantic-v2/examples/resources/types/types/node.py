from typing import List, Optional

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.types.types.node import Node
from resources.types.types.tree import Tree

from pydantic import BaseModel


class Node(BaseModel):
    name: str
    nodes: Optional[List[Node]] = None
    trees: Optional[List[Tree]] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
