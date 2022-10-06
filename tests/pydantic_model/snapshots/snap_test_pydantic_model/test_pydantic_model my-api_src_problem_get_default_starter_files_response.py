import typing

import pydantic

from ..commons.language import Language
from .problem_files import ProblemFiles


class GetDefaultStarterFilesResponse(pydantic.BaseModel):
    files: typing.Dict[Language, ProblemFiles]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
