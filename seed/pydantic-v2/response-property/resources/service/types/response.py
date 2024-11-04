from pydantic import BaseModel
from resources.service.types import Movie


class Response(BaseModel):
    data: Movie
