from pydantic import BaseModel
from resources.v_2.resources.problem.types.file_info_v_2 import FileInfoV2
from typing import List
from resources.commons.types.variable_type import VariableType


class DefaultProvidedFile(BaseModel):
    file: FileInfoV2
    related_types: List[VariableType] = Field(alias="relatedTypes")
