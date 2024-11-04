from pydantic import BaseModel
from uuid import UUID


class Foo(BaseModel):
    bar_property: UUID
