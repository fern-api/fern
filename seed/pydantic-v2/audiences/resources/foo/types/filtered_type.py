from typing import Optional

from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class FilteredType(BaseModel):
    public_property: Optional[str] = None
    private_property: int

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
