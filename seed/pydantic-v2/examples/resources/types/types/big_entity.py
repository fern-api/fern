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
from dt import datetime
from core.datetime_utils import serialize_datetime


class BigEntity(BaseModel):
    cast_member: Optional[CastMember]
    extended_movie: Optional[ExtendedMovie]
    entity: Optional[Entity] = None
    metadata: Optional[Metadata] = None
    common_metadata: Optional[Metadata]
    event_info: Optional[EventInfo]
    data: Optional[Data] = None
    migration: Optional[Migration] = None
    exception: Optional[Exception] = None
    test: Optional[Test] = None
    node: Optional[Node] = None
    directory: Optional[Directory] = None
    moment: Optional[Moment] = None

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
