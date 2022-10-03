import typing

import pydantic

from ..commons.language import Language
from .problem_files import ProblemFiles


class GetDefaultStarterFilesResponse(pydantic.BaseModel):
    files: typing.Dict[Language, ProblemFiles]
