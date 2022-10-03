from __future__ import annotations

import pydantic


class MapType(pydantic.BaseModel):
    key_type: VariableType = pydantic.Field(alias="keyType")
    value_type: VariableType = pydantic.Field(alias="valueType")

    class Config:
        allow_population_by_field_name = True


from .variable_type import VariableType  # noqa: E402

MapType.update_forward_refs()
