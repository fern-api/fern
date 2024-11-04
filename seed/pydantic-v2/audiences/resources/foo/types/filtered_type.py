from pydantic import BaseModel
from typing import Optional


class FilteredType(BaseModel):
    public_property: Optional[str] = None
    private_property: int
