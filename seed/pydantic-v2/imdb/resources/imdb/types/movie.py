from pydantic import BaseModel
from dt import datetime
from core.datetime_utils import serialize_datetime


class Movie(BaseModel):
    id: str
    title: str
    rating: float
    """
    The rating scale is one to five stars
    """

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
