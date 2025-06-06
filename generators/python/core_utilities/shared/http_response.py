from typing import Dict, Generic, TypeVar

import httpx

T = TypeVar("T")
"""Generic to represent the underlying type of the data wrapped by the HTTP response."""


class BaseHttpResponse:
    """Minimalist HTTP response wrapper that exposes response headers."""

    _response: httpx.Response

    def __init__(self, response: httpx.Response):
        self._response = response

    @property
    def headers(self) -> Dict[str, str]:
        return dict(self._response.headers)


class HttpResponse(Generic[T], BaseHttpResponse):
    """HTTP response wrapper that exposes response headers and data."""

    _data: T

    def __init__(self, response: httpx.Response, data: T):
        super().__init__(response)
        self._data = data

    @property
    def data(self) -> T:
        return self._data

    def close(self) -> None:
        self._response.close()


class AsyncHttpResponse(Generic[T], BaseHttpResponse):
    """HTTP response wrapper that exposes response headers and data."""

    _data: T

    def __init__(self, response: httpx.Response, data: T):
        super().__init__(response)
        self._data = data

    @property
    def data(self) -> T:
        return self._data

    async def close(self) -> None:
        await self._response.aclose()
