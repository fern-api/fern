from pydantic import BaseModel
from .types.parent import Parent


class Child(BaseModel, Parent):
    child: str
