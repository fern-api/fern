from pydantic import BaseModel


class Response(BaseModel):
    foo: str
