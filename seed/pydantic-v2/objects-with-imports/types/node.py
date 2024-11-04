from pydantic import BaseModel
from typing import Optional
from resources.commons.resources.metadata.types.metadata import Metadata
from dt import datetime
from core.datetime_utils import serialize_datetime


class Node(BaseModel):
    id: str
    label: Optional[str] = None
    metadata: Optional[Metadata] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
