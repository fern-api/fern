import typing

import pydantic

from .migration_status import MigrationStatus


class Migration(pydantic.BaseModel):
    name: str
    status: MigrationStatus

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)
