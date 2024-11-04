from pydantic import BaseModel
from uuid import UUID


class FolderCFoo(BaseModel):
    bar_property: UUID
