import typing

import pydantic

from ...commons.fern_filepath import FernFilepath


class DeclaredServiceName(pydantic.BaseModel):
    fern_filepath: FernFilepath = pydantic.Field(alias="fernFilepath")
    name: str

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
