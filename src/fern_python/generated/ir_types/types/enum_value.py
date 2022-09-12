from ..commons.wire_string_with_all_casings import WireStringWithAllCasings
from ..commons.with_docs import WithDocs


class EnumValue(WithDocs):
    name: WireStringWithAllCasings
    value: str
