from typing import Optional

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.folder_c.resources.common.types.foo import Foo

from pydantic import BaseModel


class Foo(BaseModel):
    foo: Optional[Foo] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
