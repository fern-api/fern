from ...commons.with_docs import WithDocs
from ...types.type_reference import TypeReference
from ...commons.wire_string_with_all_casings import WireStringWithAllCasings
import pydantic


class QueryParameter(WithDocs):
    name: WireStringWithAllCasings
    value_type: TypeReference = pydantic.Field(alias="valueType")
