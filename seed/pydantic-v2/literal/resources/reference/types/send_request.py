from typing import Optional

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.reference.types.container_object import ContainerObject

from pydantic import BaseModel


class SendRequest(BaseModel):
    prompt: str
    query: str
    stream: bool
    context: str
    maybe_context: Optional[str]
    container_object: ContainerObject

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
