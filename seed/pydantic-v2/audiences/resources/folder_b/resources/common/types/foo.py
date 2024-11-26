from pydantic import BaseModel
from typing import Optional
from resources.folder_c.resources.common.types.folder_c_foo import FolderCFoo
from dt import datetime
from core.datetime_utils import serialize_datetime


class Foo(BaseModel):
    foo: Optional[FolderCFoo] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
