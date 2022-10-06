import typing

import pydantic

from ..commons.user_id import UserId
from .playlist_create_request import PlaylistCreateRequest
from .playlist_id import PlaylistId


class Playlist(PlaylistCreateRequest):
    playlist_id: PlaylistId
    owner_id: UserId = pydantic.Field(alias="owner-id")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
