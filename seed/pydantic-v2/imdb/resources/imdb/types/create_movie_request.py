from pydantic import BaseModel


class CreateMovieRequest(BaseModel):
    title: str
    rating: float
