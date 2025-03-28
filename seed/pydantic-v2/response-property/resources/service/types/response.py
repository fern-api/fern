from types.with_metadata import WithMetadata

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.service.types.movie import Movie
from resources.service.types.with_docs import WithDocs

from pydantic import BaseModel


class Response(BaseModel, WithMetadata, WithDocs):
    data: Movie

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
