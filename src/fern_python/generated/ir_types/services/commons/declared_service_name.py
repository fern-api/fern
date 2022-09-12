import pydantic

from ...commons.fern_filepath import FernFilepath


class DeclaredServiceName(pydantic.BaseModel):
    fern_filepath: FernFilepath = pydantic.Field(alias="fernFilepath")
    name: str
