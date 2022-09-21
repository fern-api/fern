import pydantic

from .resolved_type_reference import ResolvedTypeReference
from .type_reference import TypeReference


class AliasTypeDeclaration(pydantic.BaseModel):
    alias_of: TypeReference = pydantic.Field(alias="aliasOf")
    resolved_type: ResolvedTypeReference = pydantic.Field(alias="resolvedType")

    class Config:
        allow_population_by_field_name = True
