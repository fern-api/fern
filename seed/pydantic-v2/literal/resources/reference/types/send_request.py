from pydantic import BaseModel
from typing import Optional
from resources.reference.types.container_object import ContainerObject


class SendRequest(BaseModel):
    prompt: str
    query: str
    stream: bool
    context: str
    maybe_context: Optional[str] = Field(alias="maybeContext", default=None)
    container_object: ContainerObject = Field(alias="containerObject")
