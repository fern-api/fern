from pydantic import BaseModel
from typing import Optional
from resources.commons.resources.metadata.types.metadata import Metadata


class Node(BaseModel):
    id: str
    label: Optional[str] = None
    metadata: Optional[Metadata] = None
