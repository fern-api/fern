from pydantic import BaseModel
from resources.v_2.resources.v_3.resources.problem.types import FileInfoV2
from typing import List
from resources.commons.types import VariableType


class DefaultProvidedFile(BaseModel):
    file: FileInfoV2
    related_types: List[VariableType]
