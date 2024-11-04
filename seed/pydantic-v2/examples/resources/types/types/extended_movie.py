from pydantic import BaseModel
from typing import List


class ExtendedMovie(BaseModel):
    cast: List[str]
