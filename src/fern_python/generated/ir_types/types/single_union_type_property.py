import pydantic

from ..commons.wire_string_with_all_casings import WireStringWithAllCasings
from .type_reference import TypeReference


class SingleUnionTypeProperty(pydantic.BaseModel):
    name: WireStringWithAllCasings
    type: TypeReference
