import typing

import pydantic

from ..commons.language import Language
from ..v_2.problem.files import Files


class WorkspaceStarterFilesResponseV2(pydantic.BaseModel):
    files_by_language: typing.Dict[Language, Files] = pydantic.Field(alias="filesByLanguage")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
