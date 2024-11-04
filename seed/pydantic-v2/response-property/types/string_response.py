from pydantic import BaseModel


class StringResponse(BaseModel):
    data: str
