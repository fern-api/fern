from pydantic import BaseModel
from dt import datetime
from core.datetime_utils import serialize_datetime


class NextPage(BaseModel):
    page: int
    starting_after: str

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
