from pydantic import BaseModel
from types.with_metadata import WithMetadata
from resources.service.types.with_docs import WithDocs
from resources.service.types.movie import Movie


class Response(BaseModel, WithMetadata, WithDocs):
    data: Movie
