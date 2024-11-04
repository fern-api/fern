from pydantic import BaseModel
from .types.docs import Docs


class Json(BaseModel, Docs):
    raw: str
