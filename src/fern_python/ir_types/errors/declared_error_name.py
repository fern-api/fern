import pydantic

from ..commons.fern_filepath import FernFilepath


class DeclaredErrorName(pydantic.BaseModel):
    fern_filepath: FernFilepath = pydantic.Field(alias="fernFilepath")
