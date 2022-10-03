import typing

import pydantic

from ....commons.language import Language
from .file_info_v2 import FileInfoV2


class GetBasicSolutionFileResponse(pydantic.BaseModel):
    solution_file_by_language: typing.Dict[Language, FileInfoV2] = pydantic.Field(alias="solutionFileByLanguage")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
