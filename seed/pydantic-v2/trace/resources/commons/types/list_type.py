from pydantic import BaseModel
from resources.commons.types.variable_type import VariableType
from typing import Optional


class ListType(BaseModel):
    value_type: VariableType = Field(alias="valueType")
    is_fixed_length: Optional[bool] = Field(alias="isFixedLength", default=None)
    """
    Whether this list is fixed-size (for languages that supports fixed-size lists). Defaults to false.
    """
