from pydantic import BaseModel


class Json(BaseModel):
    raw: str
