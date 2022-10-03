import pydantic


class ExpressionLocation(pydantic.BaseModel):
    start: int
    offset: int
