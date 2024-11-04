from pydantic import BaseModel


class EchoRequest(BaseModel):
    name: str
    size: int
