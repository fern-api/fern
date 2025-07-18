# This file was auto-generated by Fern from our API Definition.

import typing

from ..core.client_wrapper import AsyncClientWrapper, SyncClientWrapper
from ..core.request_options import RequestOptions
from .raw_client import AsyncRawServiceClient, RawServiceClient


class ServiceClient:
    def __init__(self, *, client_wrapper: SyncClientWrapper):
        self._raw_client = RawServiceClient(client_wrapper=client_wrapper)

    @property
    def with_raw_response(self) -> RawServiceClient:
        """
        Retrieves a raw implementation of this client that returns raw responses.

        Returns
        -------
        RawServiceClient
        """
        return self._raw_client

    def post(
        self,
        path_param: str,
        service_param: str,
        resource_param: str,
        endpoint_param: int,
        *,
        request_options: typing.Optional[RequestOptions] = None,
    ) -> None:
        """
        Parameters
        ----------
        path_param : str

        service_param : str

        resource_param : str

        endpoint_param : int

        request_options : typing.Optional[RequestOptions]
            Request-specific configuration.

        Returns
        -------
        None

        Examples
        --------
        from seed import SeedApiWideBasePath

        client = SeedApiWideBasePath(
            base_url="https://yourhost.com/path/to/api",
        )
        client.service.post(
            service_param="serviceParam",
            resource_param="resourceParam",
            endpoint_param=1,
        )
        """
        _response = self._raw_client.post(
            path_param, service_param, resource_param, endpoint_param, request_options=request_options
        )
        return _response.data


class AsyncServiceClient:
    def __init__(self, *, client_wrapper: AsyncClientWrapper):
        self._raw_client = AsyncRawServiceClient(client_wrapper=client_wrapper)

    @property
    def with_raw_response(self) -> AsyncRawServiceClient:
        """
        Retrieves a raw implementation of this client that returns raw responses.

        Returns
        -------
        AsyncRawServiceClient
        """
        return self._raw_client

    async def post(
        self,
        path_param: str,
        service_param: str,
        resource_param: str,
        endpoint_param: int,
        *,
        request_options: typing.Optional[RequestOptions] = None,
    ) -> None:
        """
        Parameters
        ----------
        path_param : str

        service_param : str

        resource_param : str

        endpoint_param : int

        request_options : typing.Optional[RequestOptions]
            Request-specific configuration.

        Returns
        -------
        None

        Examples
        --------
        import asyncio

        from seed import AsyncSeedApiWideBasePath

        client = AsyncSeedApiWideBasePath(
            base_url="https://yourhost.com/path/to/api",
        )


        async def main() -> None:
            await client.service.post(
                service_param="serviceParam",
                resource_param="resourceParam",
                endpoint_param=1,
            )


        asyncio.run(main())
        """
        _response = await self._raw_client.post(
            path_param, service_param, resource_param, endpoint_param, request_options=request_options
        )
        return _response.data
