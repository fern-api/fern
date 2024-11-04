from pydantic import BaseModel
from types import Type


class ResponseType(BaseModel):
    type: Type
