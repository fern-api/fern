from pydantic import BaseModel
from .types.json import Json


class NestedType(BaseModel, Json):
    name: str
