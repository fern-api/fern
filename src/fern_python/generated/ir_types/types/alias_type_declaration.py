from __future__ import annotations

import pydantic


class AliasTypeDeclaration(pydantic.BaseModel):
    alias_of: TypeReference = pydantic.Field(alias="aliasOf")
    resolved_type: ResolvedTypeReference = pydantic.Field(alias="resolvedType")

    class Config:
        allow_population_by_field_name = True


from .resolved_type_reference import ResolvedTypeReference  # noqa: E402
from .type_reference import TypeReference  # noqa: E402

AliasTypeDeclaration.update_forward_refs()
