from pydantic import BaseModel
from typing import Dict, Optional
from dt import datetime
from core.datetime_utils import serialize_datetime


class TypeWithOptionalMap(BaseModel):
    key: str
    column_values: Dict[str, Optional[str]]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
