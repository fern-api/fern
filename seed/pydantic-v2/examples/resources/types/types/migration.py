from pydantic import BaseModel
from resources.types.types.migration_status import MigrationStatus
from dt import datetime
from core.datetime_utils import serialize_datetime


class Migration(BaseModel):
    name: str
    status: MigrationStatus

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
