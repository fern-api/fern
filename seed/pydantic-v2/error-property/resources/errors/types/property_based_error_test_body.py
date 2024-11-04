from pydantic import BaseModel


class PropertyBasedErrorTestBody(BaseModel):
    message: str
