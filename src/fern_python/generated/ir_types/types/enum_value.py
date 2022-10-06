import typing

from ..commons.wire_string_with_all_casings import WireStringWithAllCasings
from ..commons.with_docs import WithDocs


class EnumValue(WithDocs):
    name: WireStringWithAllCasings
    value: str

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
