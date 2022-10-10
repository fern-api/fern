import abc
import inspect
import typing

import fastapi

from ...core.abstract_fern_service import AbstractFernService
from ...core.route_args import get_route_args
from ...security import ApiAuth, FernAuth
from .types.playlist import Playlist
from .types.playlist_create_request import PlaylistCreateRequest
from .types.playlist_id import PlaylistId
from .types.update_playlist_request import UpdatePlaylistRequest


class AbstractPlaylistCrudService(AbstractFernService):
    """
    AbstractPlaylistCrudService is an abstract class containing the methods that your
    PlaylistCrudService implementation should implement.

    Each method is associated with an API route, which will be registered
    with FastAPI when you register your implementation using Fern's register()
    function.
    """

    @abc.abstractmethod
    def createPlaylist(self, *, request: PlaylistCreateRequest, service_param: int, auth: ApiAuth) -> Playlist:
        ...

    @abc.abstractmethod
    def getPlaylists(
        self, *, service_param: int, limit: typing.Optional[int], other_field: str, auth: ApiAuth
    ) -> typing.List[Playlist]:
        ...

    @abc.abstractmethod
    def getPlaylist(self, *, service_param: int, playlist_id: PlaylistId) -> Playlist:
        ...

    @abc.abstractmethod
    def updatePlaylist(
        self,
        *,
        request: typing.Optional[UpdatePlaylistRequest],
        service_param: int,
        playlist_id: PlaylistId,
        auth: ApiAuth
    ) -> typing.Optional[Playlist]:
        ...

    @abc.abstractmethod
    def deletePlaylist(self, *, service_param: int, playlist_id: PlaylistId, auth: ApiAuth) -> None:
        ...

    """
    Below are internal methods used by Fern to register your implementation.
    You can ignore them.
    """

    @classmethod
    def _init_fern(cls, router: fastapi.APIRouter) -> None:
        cls.__init_createPlaylist(router=router)
        cls.__init_getPlaylists(router=router)
        cls.__init_getPlaylist(router=router)
        cls.__init_updatePlaylist(router=router)
        cls.__init_deletePlaylist(router=router)

    @classmethod
    def __init_createPlaylist(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature()
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "request":
                new_parameters.append(parameter.replace(default=fastapi.Body(...)))
            elif parameter_name == "service_param":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            elif parameter_name == "auth":
                new_parameters.append(parameter.replace(default=fastapi.Depends(FernAuth)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.createPlaylist = router.post(  # type: ignore
            path="/v2/playlist/{service_param}/create", response_model=Playlist, **get_route_args(cls.createPlaylist)
        )(cls.createPlaylist)

    @classmethod
    def __init_getPlaylists(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature()
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "service_param":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            elif parameter_name == "limit":
                new_parameters.append(parameter.replace(default=fastapi.Query(default=None)))
            elif parameter_name == "other_field":
                new_parameters.append(parameter.replace(default=fastapi.Query(alias="otherField")))
            elif parameter_name == "auth":
                new_parameters.append(parameter.replace(default=fastapi.Depends(FernAuth)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.getPlaylists = router.get(  # type: ignore
            path="/v2/playlist/{service_param}/all",
            response_model=typing.List[Playlist],
            **get_route_args(cls.getPlaylists),
        )(cls.getPlaylists)

    @classmethod
    def __init_getPlaylist(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature()
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "service_param":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            elif parameter_name == "playlist_id":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.getPlaylist = router.get(  # type: ignore
            path="/v2/playlist/{service_param}/{playlist_id}",
            response_model=Playlist,
            **get_route_args(cls.getPlaylist),
        )(cls.getPlaylist)

    @classmethod
    def __init_updatePlaylist(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature()
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "request":
                new_parameters.append(parameter.replace(default=fastapi.Body(...)))
            elif parameter_name == "service_param":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            elif parameter_name == "playlist_id":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            elif parameter_name == "auth":
                new_parameters.append(parameter.replace(default=fastapi.Depends(FernAuth)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.updatePlaylist = router.put(  # type: ignore
            path="/v2/playlist/{service_param}/{playlist_id}",
            response_model=typing.Optional[Playlist],
            **get_route_args(cls.updatePlaylist),
        )(cls.updatePlaylist)

    @classmethod
    def __init_deletePlaylist(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature()
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "service_param":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            elif parameter_name == "playlist_id":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            elif parameter_name == "auth":
                new_parameters.append(parameter.replace(default=fastapi.Depends(FernAuth)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.deletePlaylist = router.delete(  # type: ignore
            path="/v2/playlist/{service_param}/{playlist_id}", **get_route_args(cls.deletePlaylist)
        )(cls.deletePlaylist)
