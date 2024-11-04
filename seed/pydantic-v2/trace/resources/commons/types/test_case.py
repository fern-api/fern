from pydantic import BaseModel
from typing import List
from resources.commons.types import VariableValue


class TestCase(BaseModel):
    id: str
    params: List[VariableValue]
