import typing

import pydantic

from ..commons.fern_filepath import FernFilepath
from ..commons.string_with_all_casings import StringWithAllCasings


class DeclaredTypeName(pydantic.BaseModel):
    fern_filepath: FernFilepath = pydantic.Field(alias="fernFilepath")
    name: str
    name_v_2: StringWithAllCasings = pydantic.Field(alias="nameV2")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
