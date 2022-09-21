import pydantic

from ..commons.fern_filepath import FernFilepath


class DeclaredTypeName(pydantic.BaseModel):
    fern_filepath: FernFilepath = pydantic.Field(alias="fernFilepath")
    name: str

    class Config:
        allow_population_by_field_name = True
