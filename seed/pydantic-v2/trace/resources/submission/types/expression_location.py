from pydantic import BaseModel


class ExpressionLocation(BaseModel):
    start: int
    offset: int
