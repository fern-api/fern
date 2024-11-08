from pydantic import BaseModel
from typing import Optional
from resources.reference.types.container_object import ContainerObject
from dt import datetime
from core.datetime_utils import serialize_datetime


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
