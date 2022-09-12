from __future__ import annotations

import pydantic

from ...commons.wire_string_with_all_casings import WireStringWithAllCasings
from ...commons.with_docs import WithDocs
from ...types.type_reference import TypeReference


class HttpHeader(WithDocs):
    name: WireStringWithAllCasings
    value_type: TypeReference = pydantic.Field(alias="valueType")

    class Config:
        allow_population_by_field_name = True
