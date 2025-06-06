# This file was auto-generated by Fern from our API Definition.

from ..core.client_wrapper import SyncClientWrapper
from .raw_client import RawServiceClient
import typing
from ..core.request_options import RequestOptions
from ..core.client_wrapper import AsyncClientWrapper
from .raw_client import AsyncRawServiceClient
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
    
    def get(self, *, request_options: typing.Optional[RequestOptions] = None) -> typing.Iterator[bytes]:
        """
        Parameters
        ----------
        request_options : typing.Optional[RequestOptions]
            Request-specific configuration. You can pass in configuration such as `chunk_size`, and more to customize the request and response.
        
        Returns
        -------
        typing.Iterator[bytes]
        """
        with self._raw_client.get(request_options=request_options) as r:
            yield from r.data
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
    
    async def get(self, *, request_options: typing.Optional[RequestOptions] = None) -> typing.AsyncIterator[bytes]:
        """
        Parameters
        ----------
        request_options : typing.Optional[RequestOptions]
            Request-specific configuration. You can pass in configuration such as `chunk_size`, and more to customize the request and response.
        
        Returns
        -------
        typing.AsyncIterator[bytes]
        """
        async with self._raw_client.get(request_options=request_options) as r:
            async for _chunk in r.data:
                yield _chunk
