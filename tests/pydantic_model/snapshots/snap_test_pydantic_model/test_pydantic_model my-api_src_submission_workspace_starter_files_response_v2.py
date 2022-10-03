import typing

import pydantic

from ..commons.language import Language
from ..v_2.problem.files import Files


class WorkspaceStarterFilesResponseV2(pydantic.BaseModel):
    files_by_language: typing.Dict[Language, Files] = pydantic.Field(alias="filesByLanguage")

    class Config:
        allow_population_by_field_name = True
