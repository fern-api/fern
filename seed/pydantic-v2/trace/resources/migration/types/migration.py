from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.migration.types.migration_status import MigrationStatus

from pydantic import BaseModel


class Migration(BaseModel):
    name: str
    status: MigrationStatus

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
