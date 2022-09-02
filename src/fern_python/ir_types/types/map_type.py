from __future__ import annotations
import pydantic


class MapType(pydantic.BaseModel):
    key_type: TypeReference = pydantic.Field(alias="keyType")
    value_type: TypeReference = pydantic.Field(alias="valueType")

    class Config:
        allow_population_by_field_name = True


from .type_reference import TypeReference  # noqa E402

MapType.update_forward_refs()
