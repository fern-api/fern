from pydantic import BaseModel
from typing import Optional
from resources.folder_c.resources.common.types import FolderCFoo


class Foo(BaseModel):
    foo: Optional[FolderCFoo] = None
