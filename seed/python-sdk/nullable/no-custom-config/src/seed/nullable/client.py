# This file was auto-generated by Fern from our API Definition.

import typing

from ..core.client_wrapper import AsyncClientWrapper, SyncClientWrapper
from ..core.request_options import RequestOptions
from .raw_client import AsyncRawNullableClient, RawNullableClient
from .types.metadata import Metadata
from .types.user import User

# this is used as the default value for optional parameters
OMIT = typing.cast(typing.Any, ...)


class NullableClient:
    def __init__(self, *, client_wrapper: SyncClientWrapper):
        self._raw_client = RawNullableClient(client_wrapper=client_wrapper)

    @property
    def with_raw_response(self) -> RawNullableClient:
        """
        Retrieves a raw implementation of this client that returns raw responses.

        Returns
        -------
        RawNullableClient
        """
        return self._raw_client

    def get_users(
        self,
        *,
        usernames: typing.Optional[typing.Union[str, typing.Sequence[str]]] = None,
        avatar: typing.Optional[str] = None,
        activated: typing.Optional[typing.Union[bool, typing.Sequence[bool]]] = None,
        tags: typing.Optional[typing.Union[str, typing.Sequence[str]]] = None,
        extra: typing.Optional[bool] = None,
        request_options: typing.Optional[RequestOptions] = None,
    ) -> typing.List[User]:
        """
        Parameters
        ----------
        usernames : typing.Optional[typing.Union[str, typing.Sequence[str]]]

        avatar : typing.Optional[str]

        activated : typing.Optional[typing.Union[bool, typing.Sequence[bool]]]

        tags : typing.Optional[typing.Union[str, typing.Sequence[str]]]

        extra : typing.Optional[bool]

        request_options : typing.Optional[RequestOptions]
            Request-specific configuration.

        Returns
        -------
        typing.List[User]

        Examples
        --------
        from seed import SeedNullable

        client = SeedNullable(
            base_url="https://yourhost.com/path/to/api",
        )
        client.nullable.get_users(
            usernames="usernames",
            avatar="avatar",
            activated=True,
            tags="tags",
            extra=True,
        )
        """
        _response = self._raw_client.get_users(
            usernames=usernames,
            avatar=avatar,
            activated=activated,
            tags=tags,
            extra=extra,
            request_options=request_options,
        )
        return _response.data

    def create_user(
        self,
        *,
        username: str,
        tags: typing.Optional[typing.Sequence[str]] = OMIT,
        metadata: typing.Optional[Metadata] = OMIT,
        avatar: typing.Optional[str] = OMIT,
        request_options: typing.Optional[RequestOptions] = None,
    ) -> User:
        """
        Parameters
        ----------
        username : str

        tags : typing.Optional[typing.Sequence[str]]

        metadata : typing.Optional[Metadata]

        avatar : typing.Optional[str]

        request_options : typing.Optional[RequestOptions]
            Request-specific configuration.

        Returns
        -------
        User

        Examples
        --------
        import datetime

        from seed import SeedNullable
        from seed.nullable import Metadata, Status

        client = SeedNullable(
            base_url="https://yourhost.com/path/to/api",
        )
        client.nullable.create_user(
            username="username",
            tags=["tags", "tags"],
            metadata=Metadata(
                created_at=datetime.datetime.fromisoformat(
                    "2024-01-15 09:30:00+00:00",
                ),
                updated_at=datetime.datetime.fromisoformat(
                    "2024-01-15 09:30:00+00:00",
                ),
                avatar="avatar",
                activated=True,
                status=Status(),
                values={"values": "values"},
            ),
            avatar="avatar",
        )
        """
        _response = self._raw_client.create_user(
            username=username, tags=tags, metadata=metadata, avatar=avatar, request_options=request_options
        )
        return _response.data

    def delete_user(
        self, *, username: typing.Optional[str] = OMIT, request_options: typing.Optional[RequestOptions] = None
    ) -> bool:
        """
        Parameters
        ----------
        username : typing.Optional[str]
            The user to delete.

        request_options : typing.Optional[RequestOptions]
            Request-specific configuration.

        Returns
        -------
        bool

        Examples
        --------
        from seed import SeedNullable

        client = SeedNullable(
            base_url="https://yourhost.com/path/to/api",
        )
        client.nullable.delete_user(
            username="xy",
        )
        """
        _response = self._raw_client.delete_user(username=username, request_options=request_options)
        return _response.data


class AsyncNullableClient:
    def __init__(self, *, client_wrapper: AsyncClientWrapper):
        self._raw_client = AsyncRawNullableClient(client_wrapper=client_wrapper)

    @property
    def with_raw_response(self) -> AsyncRawNullableClient:
        """
        Retrieves a raw implementation of this client that returns raw responses.

        Returns
        -------
        AsyncRawNullableClient
        """
        return self._raw_client

    async def get_users(
        self,
        *,
        usernames: typing.Optional[typing.Union[str, typing.Sequence[str]]] = None,
        avatar: typing.Optional[str] = None,
        activated: typing.Optional[typing.Union[bool, typing.Sequence[bool]]] = None,
        tags: typing.Optional[typing.Union[str, typing.Sequence[str]]] = None,
        extra: typing.Optional[bool] = None,
        request_options: typing.Optional[RequestOptions] = None,
    ) -> typing.List[User]:
        """
        Parameters
        ----------
        usernames : typing.Optional[typing.Union[str, typing.Sequence[str]]]

        avatar : typing.Optional[str]

        activated : typing.Optional[typing.Union[bool, typing.Sequence[bool]]]

        tags : typing.Optional[typing.Union[str, typing.Sequence[str]]]

        extra : typing.Optional[bool]

        request_options : typing.Optional[RequestOptions]
            Request-specific configuration.

        Returns
        -------
        typing.List[User]

        Examples
        --------
        import asyncio

        from seed import AsyncSeedNullable

        client = AsyncSeedNullable(
            base_url="https://yourhost.com/path/to/api",
        )


        async def main() -> None:
            await client.nullable.get_users(
                usernames="usernames",
                avatar="avatar",
                activated=True,
                tags="tags",
                extra=True,
            )


        asyncio.run(main())
        """
        _response = await self._raw_client.get_users(
            usernames=usernames,
            avatar=avatar,
            activated=activated,
            tags=tags,
            extra=extra,
            request_options=request_options,
        )
        return _response.data

    async def create_user(
        self,
        *,
        username: str,
        tags: typing.Optional[typing.Sequence[str]] = OMIT,
        metadata: typing.Optional[Metadata] = OMIT,
        avatar: typing.Optional[str] = OMIT,
        request_options: typing.Optional[RequestOptions] = None,
    ) -> User:
        """
        Parameters
        ----------
        username : str

        tags : typing.Optional[typing.Sequence[str]]

        metadata : typing.Optional[Metadata]

        avatar : typing.Optional[str]

        request_options : typing.Optional[RequestOptions]
            Request-specific configuration.

        Returns
        -------
        User

        Examples
        --------
        import asyncio
        import datetime

        from seed import AsyncSeedNullable
        from seed.nullable import Metadata, Status

        client = AsyncSeedNullable(
            base_url="https://yourhost.com/path/to/api",
        )


        async def main() -> None:
            await client.nullable.create_user(
                username="username",
                tags=["tags", "tags"],
                metadata=Metadata(
                    created_at=datetime.datetime.fromisoformat(
                        "2024-01-15 09:30:00+00:00",
                    ),
                    updated_at=datetime.datetime.fromisoformat(
                        "2024-01-15 09:30:00+00:00",
                    ),
                    avatar="avatar",
                    activated=True,
                    status=Status(),
                    values={"values": "values"},
                ),
                avatar="avatar",
            )


        asyncio.run(main())
        """
        _response = await self._raw_client.create_user(
            username=username, tags=tags, metadata=metadata, avatar=avatar, request_options=request_options
        )
        return _response.data

    async def delete_user(
        self, *, username: typing.Optional[str] = OMIT, request_options: typing.Optional[RequestOptions] = None
    ) -> bool:
        """
        Parameters
        ----------
        username : typing.Optional[str]
            The user to delete.

        request_options : typing.Optional[RequestOptions]
            Request-specific configuration.

        Returns
        -------
        bool

        Examples
        --------
        import asyncio

        from seed import AsyncSeedNullable

        client = AsyncSeedNullable(
            base_url="https://yourhost.com/path/to/api",
        )


        async def main() -> None:
            await client.nullable.delete_user(
                username="xy",
            )


        asyncio.run(main())
        """
        _response = await self._raw_client.delete_user(username=username, request_options=request_options)
        return _response.data
