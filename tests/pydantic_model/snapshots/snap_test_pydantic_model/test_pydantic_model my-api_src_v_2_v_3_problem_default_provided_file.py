import typing

import pydantic

from ....commons.variable_type import VariableType
from .file_info_v2 import FileInfoV2


class DefaultProvidedFile(pydantic.BaseModel):
    file: FileInfoV2
    related_types: typing.List[VariableType] = pydantic.Field(alias="relatedTypes")

    class Config:
        allow_population_by_field_name = True
