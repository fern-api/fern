from pydantic import BaseModel, Field
from ..commons.fern_filepath import FernFilepath


class DeclaredTypeName(BaseModel):
    fern_filepath: FernFilepath = Field(alias="fernFilepath")
