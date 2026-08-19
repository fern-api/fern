from pydantic import BaseModel
from resources.types.types.movie import Movie
from typing import List
from dt import datetime
from core.datetime_utils import serialize_datetime


class ExtendedMovie(BaseModel, Movie):
    cast: List[str]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
