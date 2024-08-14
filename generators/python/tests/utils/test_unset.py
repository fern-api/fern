from typing import Optional
from .union_utils.types.core.pydantic_utilities import UniversalBaseModel


class SomeObject(UniversalBaseModel):
    name: str
    age: int
    city: str = "NY"
    optional: Optional[str] = None

def test_unset() -> None:
    so = SomeObject(name="John", age=30)
    assert so.dict() == {"name": "John", "age": 30, "city": "NY"}
    assert so.dict(exclude_unset=True) == {"name": "John", "age": 30, "city": "NY"}
