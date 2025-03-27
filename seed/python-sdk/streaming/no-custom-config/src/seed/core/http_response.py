import httpx
import typing
from types import TracebackType
from typing import Callable, Generic, TypeVar
from typing_extensions import ParamSpec # type: ignore

P = ParamSpec("P")
R = TypeVar("R")


class HttpResponse(Generic[R]):
    _response: httpx.Response
    _data: R

    def __init__(self, response: httpx.Response, data: R):
        self._response = response
        self._data = data

    @property
    def headers(self) -> typing.Dict[str, str]:
        return dict(self._response.headers)

    @property
    def data(self) -> R:
        return self._data
    
    def close(self) -> None:
        """
        Close the response and release the connection.

        Automatically called if the response body is read to completion.
        """
        self._response.close()

        
class AsyncHttpResponse(Generic[R]):
    _response: httpx.Response
    _data: R

    def __init__(self, response: httpx.Response, data: R):
        self._response = response
        self._data = data

    @property
    def headers(self) -> typing.Dict[str, str]:
        return dict(self._response.headers)

    @property
    def data(self) -> R:
        return self._data
    
    async def close(self) -> None:
        """
        Close the response and release the connection.

        Automatically called if the response body is read to completion.
        """
        await self._response.aclose()


class StreamResponseManager(Generic[R]):
    def __init__(self, stream_func: Callable[[], HttpResponse[typing.Iterator[R]]]) -> None:
        self._stream_func = stream_func
        self._response: typing.Optional[HttpResponse[typing.Iterator[R]]] = None

    def __enter__(self) -> HttpResponse[typing.Iterator[R]]:
        self._response = self._stream_func()
        return self._response

    def __exit__(
        self,
        exc_type: typing.Optional[typing.Type[BaseException]],
        exc: typing.Optional[BaseException],
        exc_tb: typing.Optional[TracebackType],
    ) -> None:
        if self._response is not None:
            self._response.close()


class AsyncStreamResponseManager(Generic[R]):
    def __init__(self, stream_func: Callable[[], typing.Awaitable[AsyncHttpResponse[typing.AsyncIterator[R]]]]) -> None:
        self._stream_func = stream_func
        self._response: typing.Optional[AsyncHttpResponse[typing.AsyncIterator[R]]] = None

    async def __aenter__(self) -> AsyncHttpResponse[typing.AsyncIterator[R]]:
        self._response = await self._stream_func()
        return self._response

    async def __aexit__(
        self,
        exc_type: typing.Optional[typing.Type[BaseException]],
        exc: typing.Optional[BaseException],
        exc_tb: typing.Optional[TracebackType],
    ) -> None:
        if self._response is not None:
            await self._response.close()
