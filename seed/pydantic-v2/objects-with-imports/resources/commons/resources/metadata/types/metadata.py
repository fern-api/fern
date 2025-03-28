from typing import Dict, Optional

from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class Metadata(BaseModel):
    id: str
    data: Optional[Dict[str, str]] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
