from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import BaseModel


class GenericCreateProblemError(BaseModel):
    message: str
    type: str
    stacktrace: str

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
