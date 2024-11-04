from pydantic import BaseModel


class StuntDouble(BaseModel):
    name: str
    actor_or_actress_id: str = Field(alias="actorOrActressId")
