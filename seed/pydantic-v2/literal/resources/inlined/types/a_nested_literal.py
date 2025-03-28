from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class ANestedLiteral(BaseModel):
    my_literal: str

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
