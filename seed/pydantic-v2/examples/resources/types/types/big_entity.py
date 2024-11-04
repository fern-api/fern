from pydantic import BaseModel
from typing import Optional
from resources.types.types import (
    CastMember,
    ExtendedMovie,
    Entity,
    Metadata,
    Migration,
    Exception,
    Test,
    Node,
    Directory,
    Moment,
)
from resources.commons.resources.types.types import Metadata, EventInfo, Data


class BigEntity(BaseModel):
    cast_member: Optional[CastMember] = None
    extended_movie: Optional[ExtendedMovie] = None
    entity: Optional[Entity] = None
    metadata: Optional[Metadata] = None
    common_metadata: Optional[Metadata] = None
    event_info: Optional[EventInfo] = None
    data: Optional[Data] = None
    migration: Optional[Migration] = None
    exception: Optional[Exception] = None
    test: Optional[Test] = None
    node: Optional[Node] = None
    directory: Optional[Directory] = None
    moment: Optional[Moment] = None
