from pydantic import BaseModel


class RuntimeError(BaseModel):
    message: str
