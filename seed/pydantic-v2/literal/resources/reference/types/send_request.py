from pydantic import BaseModel
from typing import Optional
from resources.reference.types import ContainerObject


class SendRequest(BaseModel):
    prompt: str
    query: str
    stream: bool
    context: str
    maybe_context: Optional[str] = None
    container_object: ContainerObject
