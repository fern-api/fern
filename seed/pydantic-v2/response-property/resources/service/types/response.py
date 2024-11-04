from pydantic import BaseModel
from types.with_metadata import WithMetadata
from resources.service.types.with_docs import WithDocs
from resources.service.types.movie import Movie
from dt import datetime
from core.datetime_utils import serialize_datetime


class Response(BaseModel, WithMetadata, WithDocs):
    data: Movie

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
