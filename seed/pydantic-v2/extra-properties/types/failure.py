from pydantic import BaseModel


class Failure(BaseModel):
    status: str
