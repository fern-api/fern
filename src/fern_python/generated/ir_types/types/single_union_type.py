import pydantic

from ..commons.wire_string_with_all_casings import WireStringWithAllCasings
from ..commons.with_docs import WithDocs
from .single_union_type_properties import SingleUnionTypeProperties
from .type_reference import TypeReference


class SingleUnionType(WithDocs):
    discriminant_value: WireStringWithAllCasings = pydantic.Field(alias="discriminantValue")
    value_type: TypeReference = pydantic.Field(alias="valueType")
    shape: SingleUnionTypeProperties
