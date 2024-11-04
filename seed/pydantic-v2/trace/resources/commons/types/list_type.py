from pydantic import BaseModel
from resources.commons.types import VariableType
from typing import Optional


class ListType(BaseModel):
    value_type: VariableType
    is_fixed_length: Optional[bool] = None
