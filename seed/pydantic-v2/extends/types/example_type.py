from pydantic import BaseModel
from .types.docs import Docs


class ExampleType(BaseModel, Docs):
    name: str
