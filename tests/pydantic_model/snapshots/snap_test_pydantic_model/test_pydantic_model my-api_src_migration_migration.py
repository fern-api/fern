import pydantic

from .migration_status import MigrationStatus


class Migration(pydantic.BaseModel):
    name: str
    status: MigrationStatus
