import functools
import httpx
import typing
from contextlib import AbstractContextManager
from types import TracebackType
from typing import Any, Callable, Generic, TypeVar
from typing_extensions import ParamSpec # type: ignore

P = ParamSpec("P")
R = TypeVar("R")


class APIResponse(Generic[R]):
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

        
class AsyncAPIResponse(Generic[R]):
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
    def __init__(self, initial_request_func: Callable[[], APIResponse[typing.Iterator[R]]]) -> None:
        self._initial_request_func = initial_request_func
        self.__response: typing.Optional[APIResponse[typing.Iterator[R]]] = None

    def __enter__(self) -> APIResponse[typing.Iterator[R]]:
        self.__response = self._initial_request_func()
        return self.__response

    def __exit__(
        self,
        exc_type: typing.Optional[typing.Type[BaseException]],
        exc: typing.Optional[BaseException],
        exc_tb: typing.Optional[TracebackType],
    ) -> None:
        if self.__response is not None:
            self.__response.close()


class AsyncStreamResponseManager(Generic[R]):
    def __init__(self, initial_request_func: Callable[[], typing.Awaitable[AsyncAPIResponse[typing.AsyncIterator[R]]]]) -> None:
        self._initial_request_func = initial_request_func
        self.__response: typing.Optional[AsyncAPIResponse[typing.AsyncIterator[R]]] = None

    async def __aenter__(self) -> AsyncAPIResponse[typing.AsyncIterator[R]]:
        self.__response = await self._initial_request_func()
        return self.__response

    async def __aexit__(
        self,
        exc_type: typing.Optional[typing.Type[BaseException]],
        exc: typing.Optional[BaseException],
        exc_tb: typing.Optional[TracebackType],
    ) -> None:
        if self.__response is not None:
            await self.__response.close()


def wrap_func_to_exclude_raw_response(
        func: typing.Callable[P, APIResponse[R]]
    ) -> typing.Callable[P, R]:
    """
    Wraps a function that returns APIResponse to instead return just the data portion.
    This is used to define methods with a more concise API.
    """
    @functools.wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        response = func(*args, **kwargs)
        return response.data
    
    return wrapper


def wrap_async_func_to_exclude_raw_response(
    func: typing.Callable[P, typing.Awaitable[AsyncAPIResponse[R]]]
) -> typing.Callable[P, typing.Awaitable[R]]:
    """
    Wraps an async function that returns AsyncAPIResponse to instead return just the data portion.
    This is used to define methods with a more concise API.
    """
    @functools.wraps(func)
    async def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        response = await func(*args, **kwargs)
        return response.data
    
    return wrapper