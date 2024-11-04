from pydantic import BaseModel
from types.type import Type


class ResponseType(BaseModel):
    type: Type
