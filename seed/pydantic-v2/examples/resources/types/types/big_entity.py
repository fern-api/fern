from pydantic import BaseModel
from typing import Optional
from resources.types.types.cast_member import CastMember
from resources.types.types.extended_movie import ExtendedMovie
from resources.types.types.entity import Entity
from resources.types.types.metadata import Metadata
from resources.commons.resources.types.types.metadata import Metadata
from resources.commons.resources.types.types.event_info import EventInfo
from resources.commons.resources.types.types.data import Data
from resources.types.types.migration import Migration
from resources.types.types.exception import Exception
from resources.types.types.test import Test
from resources.types.types.node import Node
from resources.types.types.directory import Directory
from resources.types.types.moment import Moment


class BigEntity(BaseModel):
    cast_member: Optional[CastMember] = Field(alias="castMember", default=None)
    extended_movie: Optional[ExtendedMovie] = Field(alias="extendedMovie", default=None)
    entity: Optional[Entity] = None
    metadata: Optional[Metadata] = None
    common_metadata: Optional[Metadata] = Field(alias="commonMetadata", default=None)
    event_info: Optional[EventInfo] = Field(alias="eventInfo", default=None)
    data: Optional[Data] = None
    migration: Optional[Migration] = None
    exception: Optional[Exception] = None
    test: Optional[Test] = None
    node: Optional[Node] = None
    directory: Optional[Directory] = None
    moment: Optional[Moment] = None
