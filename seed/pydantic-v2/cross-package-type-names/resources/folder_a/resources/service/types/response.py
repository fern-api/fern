from pydantic import BaseModel
from typing import Optional
from resources.folder_b.resources.common.types import Foo


class Response(BaseModel):
    foo: Optional[Foo] = None
