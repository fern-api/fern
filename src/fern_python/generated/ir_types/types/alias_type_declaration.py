import pydantic

from .type_reference import TypeReference


class AliasTypeDeclaration(pydantic.BaseModel):
    alias_of: TypeReference = pydantic.Field(alias="aliasOf")

    class Config:
        allow_population_by_field_name = True
