import typing

import pydantic

from ..commons.file_info import FileInfo


class ProblemFiles(pydantic.BaseModel):
    solution_file: FileInfo = pydantic.Field(alias="solutionFile")
    read_only_files: typing.List[FileInfo] = pydantic.Field(alias="readOnlyFiles")

    class Config:
        allow_population_by_field_name = True
