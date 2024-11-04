from pydantic import BaseModel
from typing import Optional


class DoubleOptional(BaseModel):
    optional_alias: Optional[Optional[str]] = Field(alias="optionalAlias", default=None)
