from typing import Optional

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.a.types.a import A

from pydantic import BaseModel


class ImportingA(BaseModel):
    a: Optional[A] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
