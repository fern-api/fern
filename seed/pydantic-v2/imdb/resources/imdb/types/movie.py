from pydantic import BaseModel


class Movie(BaseModel):
    id: str
    title: str
    rating: float
    """
    The rating scale is one to five stars
    """
