from pydantic import BaseModel


class GetShapeRequest(BaseModel):
    id: str
