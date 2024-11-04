from pydantic import BaseModel
from typing import Optional
from resources.folder_c.resources.common.types.foo import Foo


class Foo(BaseModel):
    foo: Optional[Foo] = None
