import typing

import pydantic
import typing_extensions

from .playlist_create_request import PlaylistCreateRequest
from .playlist_id import PlaylistId
from .user_id import UserId


class Playlist(PlaylistCreateRequest):
    playlist_id: PlaylistId
    owner_id: UserId = pydantic.Field(alias="owner-id")

    @pydantic.validator("playlist_id")
    def _validate_playlist_id(cls, playlist_id: PlaylistId) -> PlaylistId:
        for validator in Playlist.Validators._playlist_id:
            playlist_id = validator(playlist_id)
        return playlist_id

    @pydantic.validator("owner_id")
    def _validate_owner_id(cls, owner_id: UserId) -> UserId:
        for validator in Playlist.Validators._owner_id:
            owner_id = validator(owner_id)
        return owner_id

    class Validators:
        _playlist_id: typing.ClassVar[typing.List[typing.Callable[[PlaylistId], PlaylistId]]] = []
        _owner_id: typing.ClassVar[typing.List[typing.Callable[[UserId], UserId]]] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["playlist_id"]
        ) -> typing.Callable[[typing.Callable[[PlaylistId], PlaylistId]], typing.Callable[[PlaylistId], PlaylistId]]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["owner_id"]
        ) -> typing.Callable[[typing.Callable[[UserId], UserId]], typing.Callable[[UserId], UserId]]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "playlist_id":
                    cls._playlist_id.append(validator)
                elif field_name == "owner_id":
                    cls._owner_id.append(validator)
                else:
                    raise RuntimeError("Field does not exist on Playlist: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
