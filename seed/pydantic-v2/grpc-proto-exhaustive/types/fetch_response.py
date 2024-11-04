from pydantic import BaseModel
from typing import Optional, Dict
from .types.column import Column
from .types.usage import Usage


class FetchResponse(BaseModel):
    columns: Optional[Dict[str, Column]] = None
    namespace: Optional[str] = None
    usage: Optional[Usage] = None
