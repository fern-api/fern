from pydantic import BaseModel


class BadObjectRequestInfo(BaseModel):
    message: str
