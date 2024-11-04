from pydantic import BaseModel
from resources.migration.types import MigrationStatus


class Migration(BaseModel):
    name: str
    status: MigrationStatus
