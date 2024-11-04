from pydantic import BaseModel
from resources.types.types.movie import Movie
from typing import List


class ExtendedMovie(BaseModel, Movie):
    cast: List[str]
