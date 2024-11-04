from pydantic import BaseModel
from resources.migration.types.migration_status import MigrationStatus


class Migration(BaseModel):
    name: str
    status: MigrationStatus
