# This file was auto-generated by Fern from our API Definition.

import typing

import httpx
from ..environment import SeedMultiUrlEnvironmentEnvironment
from .http_client import AsyncHttpClient, HttpClient


class BaseClientWrapper:
    def __init__(
        self,
        *,
        token: typing.Union[str, typing.Callable[[], str]],
        headers: typing.Optional[typing.Dict[str, str]] = None,
        environment: SeedMultiUrlEnvironmentEnvironment,
        timeout: typing.Optional[float] = None,
    ):
        self._token = token
        self._headers = headers
        self._environment = environment
        self._timeout = timeout

    def get_headers(self) -> typing.Dict[str, str]:
        headers: typing.Dict[str, str] = {
            "User-Agent": "fern_multi-url-environment/0.0.1",
            "X-Fern-Language": "Python",
            "X-Fern-SDK-Name": "fern_multi-url-environment",
            "X-Fern-SDK-Version": "0.0.1",
            **(self.get_custom_headers() or {}),
        }
        headers["Authorization"] = f"Bearer {self._get_token()}"
        return headers

    def _get_token(self) -> str:
        if isinstance(self._token, str):
            return self._token
        else:
            return self._token()

    def get_custom_headers(self) -> typing.Optional[typing.Dict[str, str]]:
        return self._headers

    def get_environment(self) -> SeedMultiUrlEnvironmentEnvironment:
        return self._environment

    def get_timeout(self) -> typing.Optional[float]:
        return self._timeout


class SyncClientWrapper(BaseClientWrapper):
    def __init__(
        self,
        *,
        token: typing.Union[str, typing.Callable[[], str]],
        headers: typing.Optional[typing.Dict[str, str]] = None,
        environment: SeedMultiUrlEnvironmentEnvironment,
        timeout: typing.Optional[float] = None,
        httpx_client: httpx.Client,
    ):
        super().__init__(token=token, headers=headers, environment=environment, timeout=timeout)
        self.httpx_client = HttpClient(
            httpx_client=httpx_client, base_headers=self.get_headers, base_timeout=self.get_timeout
        )


class AsyncClientWrapper(BaseClientWrapper):
    def __init__(
        self,
        *,
        token: typing.Union[str, typing.Callable[[], str]],
        headers: typing.Optional[typing.Dict[str, str]] = None,
        environment: SeedMultiUrlEnvironmentEnvironment,
        timeout: typing.Optional[float] = None,
        httpx_client: httpx.AsyncClient,
    ):
        super().__init__(token=token, headers=headers, environment=environment, timeout=timeout)
        self.httpx_client = AsyncHttpClient(
            httpx_client=httpx_client, base_headers=self.get_headers, base_timeout=self.get_timeout
        )
