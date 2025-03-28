from typing import List, Optional

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.types.types.node import Node

from pydantic import BaseModel


class Tree(BaseModel):
    nodes: Optional[List[Node]] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
