from pydantic import BaseModel
from resources.types.types.migration_status import MigrationStatus


class Migration(BaseModel):
    name: str
    status: MigrationStatus
