from ..commons.wire_string_with_all_casings import WireStringWithAllCasings
from ..commons.with_docs import WithDocs
from .type_reference import TypeReference


class ObjectProperty(WithDocs):
    name: WireStringWithAllCasings
    valueType: TypeReference
