from typing import Optional

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.commons.resources.metadata.types.metadata import Metadata

from pydantic import BaseModel


class Node(BaseModel):
    id: str
    label: Optional[str] = None
    metadata: Optional[Metadata] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
