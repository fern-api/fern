from typing import List

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.types.types.movie import Movie

from pydantic import BaseModel


class ExtendedMovie(BaseModel, Movie):
    cast: List[str]

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
