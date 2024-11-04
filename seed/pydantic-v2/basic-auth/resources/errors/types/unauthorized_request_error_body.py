from pydantic import BaseModel


class UnauthorizedRequestErrorBody(BaseModel):
    message: str
