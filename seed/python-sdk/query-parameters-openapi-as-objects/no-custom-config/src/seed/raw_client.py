# This file was auto-generated by Fern from our API Definition.

import datetime as dt
import typing
from json.decoder import JSONDecodeError

from .core.api_error import ApiError
from .core.client_wrapper import AsyncClientWrapper, SyncClientWrapper
from .core.datetime_utils import serialize_datetime
from .core.http_response import AsyncHttpResponse, HttpResponse
from .core.pydantic_utilities import parse_obj_as
from .core.request_options import RequestOptions
from .core.serialization import convert_and_respect_annotation_metadata
from .types.nested_user import NestedUser
from .types.search_request_neighbor import SearchRequestNeighbor
from .types.search_request_neighbor_required import SearchRequestNeighborRequired
from .types.search_response import SearchResponse
from .types.user import User


class RawSeedApi:
    def __init__(self, *, client_wrapper: SyncClientWrapper):
        self._client_wrapper = client_wrapper

    def search(
        self,
        *,
        limit: int,
        id: str,
        date: str,
        deadline: dt.datetime,
        bytes: str,
        user: User,
        neighbor_required: SearchRequestNeighborRequired,
        user_list: typing.Optional[typing.Union[User, typing.Sequence[User]]] = None,
        optional_deadline: typing.Optional[dt.datetime] = None,
        key_value: typing.Optional[typing.Dict[str, typing.Optional[str]]] = None,
        optional_string: typing.Optional[str] = None,
        nested_user: typing.Optional[NestedUser] = None,
        optional_user: typing.Optional[User] = None,
        exclude_user: typing.Optional[typing.Union[User, typing.Sequence[User]]] = None,
        filter: typing.Optional[typing.Union[str, typing.Sequence[str]]] = None,
        neighbor: typing.Optional[SearchRequestNeighbor] = None,
        request_options: typing.Optional[RequestOptions] = None,
    ) -> HttpResponse[SearchResponse]:
        """
        Parameters
        ----------
        limit : int

        id : str

        date : str

        deadline : dt.datetime

        bytes : str

        user : User

        neighbor_required : SearchRequestNeighborRequired

        user_list : typing.Optional[typing.Union[User, typing.Sequence[User]]]

        optional_deadline : typing.Optional[dt.datetime]

        key_value : typing.Optional[typing.Dict[str, typing.Optional[str]]]

        optional_string : typing.Optional[str]

        nested_user : typing.Optional[NestedUser]

        optional_user : typing.Optional[User]

        exclude_user : typing.Optional[typing.Union[User, typing.Sequence[User]]]

        filter : typing.Optional[typing.Union[str, typing.Sequence[str]]]

        neighbor : typing.Optional[SearchRequestNeighbor]

        request_options : typing.Optional[RequestOptions]
            Request-specific configuration.

        Returns
        -------
        HttpResponse[SearchResponse]
            Successful response
        """
        _response = self._client_wrapper.httpx_client.request(
            "user/getUsername",
            method="GET",
            params={
                "limit": limit,
                "id": id,
                "date": date,
                "deadline": serialize_datetime(deadline),
                "bytes": bytes,
                "user": convert_and_respect_annotation_metadata(object_=user, annotation=User, direction="write"),
                "userList": convert_and_respect_annotation_metadata(
                    object_=user_list, annotation=User, direction="write"
                ),
                "optionalDeadline": serialize_datetime(optional_deadline) if optional_deadline is not None else None,
                "keyValue": key_value,
                "optionalString": optional_string,
                "nestedUser": convert_and_respect_annotation_metadata(
                    object_=nested_user, annotation=NestedUser, direction="write"
                ),
                "optionalUser": convert_and_respect_annotation_metadata(
                    object_=optional_user, annotation=User, direction="write"
                ),
                "excludeUser": convert_and_respect_annotation_metadata(
                    object_=exclude_user, annotation=User, direction="write"
                ),
                "filter": filter,
                "neighbor": convert_and_respect_annotation_metadata(
                    object_=neighbor, annotation=SearchRequestNeighbor, direction="write"
                ),
                "neighborRequired": convert_and_respect_annotation_metadata(
                    object_=neighbor_required, annotation=SearchRequestNeighborRequired, direction="write"
                ),
            },
            request_options=request_options,
        )
        try:
            if 200 <= _response.status_code < 300:
                _data = typing.cast(
                    SearchResponse,
                    parse_obj_as(
                        type_=SearchResponse,  # type: ignore
                        object_=_response.json(),
                    ),
                )
                return HttpResponse(response=_response, data=_data)
            _response_json = _response.json()
        except JSONDecodeError:
            raise ApiError(status_code=_response.status_code, headers=dict(_response.headers), body=_response.text)
        raise ApiError(status_code=_response.status_code, headers=dict(_response.headers), body=_response_json)


class AsyncRawSeedApi:
    def __init__(self, *, client_wrapper: AsyncClientWrapper):
        self._client_wrapper = client_wrapper

    async def search(
        self,
        *,
        limit: int,
        id: str,
        date: str,
        deadline: dt.datetime,
        bytes: str,
        user: User,
        neighbor_required: SearchRequestNeighborRequired,
        user_list: typing.Optional[typing.Union[User, typing.Sequence[User]]] = None,
        optional_deadline: typing.Optional[dt.datetime] = None,
        key_value: typing.Optional[typing.Dict[str, typing.Optional[str]]] = None,
        optional_string: typing.Optional[str] = None,
        nested_user: typing.Optional[NestedUser] = None,
        optional_user: typing.Optional[User] = None,
        exclude_user: typing.Optional[typing.Union[User, typing.Sequence[User]]] = None,
        filter: typing.Optional[typing.Union[str, typing.Sequence[str]]] = None,
        neighbor: typing.Optional[SearchRequestNeighbor] = None,
        request_options: typing.Optional[RequestOptions] = None,
    ) -> AsyncHttpResponse[SearchResponse]:
        """
        Parameters
        ----------
        limit : int

        id : str

        date : str

        deadline : dt.datetime

        bytes : str

        user : User

        neighbor_required : SearchRequestNeighborRequired

        user_list : typing.Optional[typing.Union[User, typing.Sequence[User]]]

        optional_deadline : typing.Optional[dt.datetime]

        key_value : typing.Optional[typing.Dict[str, typing.Optional[str]]]

        optional_string : typing.Optional[str]

        nested_user : typing.Optional[NestedUser]

        optional_user : typing.Optional[User]

        exclude_user : typing.Optional[typing.Union[User, typing.Sequence[User]]]

        filter : typing.Optional[typing.Union[str, typing.Sequence[str]]]

        neighbor : typing.Optional[SearchRequestNeighbor]

        request_options : typing.Optional[RequestOptions]
            Request-specific configuration.

        Returns
        -------
        AsyncHttpResponse[SearchResponse]
            Successful response
        """
        _response = await self._client_wrapper.httpx_client.request(
            "user/getUsername",
            method="GET",
            params={
                "limit": limit,
                "id": id,
                "date": date,
                "deadline": serialize_datetime(deadline),
                "bytes": bytes,
                "user": convert_and_respect_annotation_metadata(object_=user, annotation=User, direction="write"),
                "userList": convert_and_respect_annotation_metadata(
                    object_=user_list, annotation=User, direction="write"
                ),
                "optionalDeadline": serialize_datetime(optional_deadline) if optional_deadline is not None else None,
                "keyValue": key_value,
                "optionalString": optional_string,
                "nestedUser": convert_and_respect_annotation_metadata(
                    object_=nested_user, annotation=NestedUser, direction="write"
                ),
                "optionalUser": convert_and_respect_annotation_metadata(
                    object_=optional_user, annotation=User, direction="write"
                ),
                "excludeUser": convert_and_respect_annotation_metadata(
                    object_=exclude_user, annotation=User, direction="write"
                ),
                "filter": filter,
                "neighbor": convert_and_respect_annotation_metadata(
                    object_=neighbor, annotation=SearchRequestNeighbor, direction="write"
                ),
                "neighborRequired": convert_and_respect_annotation_metadata(
                    object_=neighbor_required, annotation=SearchRequestNeighborRequired, direction="write"
                ),
            },
            request_options=request_options,
        )
        try:
            if 200 <= _response.status_code < 300:
                _data = typing.cast(
                    SearchResponse,
                    parse_obj_as(
                        type_=SearchResponse,  # type: ignore
                        object_=_response.json(),
                    ),
                )
                return AsyncHttpResponse(response=_response, data=_data)
            _response_json = _response.json()
        except JSONDecodeError:
            raise ApiError(status_code=_response.status_code, headers=dict(_response.headers), body=_response.text)
        raise ApiError(status_code=_response.status_code, headers=dict(_response.headers), body=_response_json)
