from pydantic import BaseModel
from resources.types.types import MigrationStatus


class Migration(BaseModel):
    name: str
    status: MigrationStatus
