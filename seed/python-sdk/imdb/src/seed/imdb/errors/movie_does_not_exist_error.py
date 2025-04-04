# This file was auto-generated by Fern from our API Definition.

from ...core.api_error import ApiError
from ..types.movie_id import MovieId


class MovieDoesNotExistError(ApiError):
    def __init__(self, body: MovieId):
        super().__init__(status_code=404, body=body)
