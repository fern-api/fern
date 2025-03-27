from .types.parent import Parent
from core.datetime_utils import serialize_datetime
from dt import datetime

from pydantic import RootModel


class AliasType(RootModel[Parent]):
    root: Parent

    def get_as_parent() -> UUID:
        return self.root

    @staticmethod
    def from_parent(value: Parent) -> AliasType:
        AliasType(root=value)

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
