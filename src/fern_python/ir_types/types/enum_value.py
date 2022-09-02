from ..commons.with_docs import WithDocs
from ..commons.wire_string_with_all_casings import WireStringWithAllCasings


class EnumValue(WithDocs):
    name: WireStringWithAllCasings
    value: str
