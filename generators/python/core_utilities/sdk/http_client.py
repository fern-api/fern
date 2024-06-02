import asyncio
import email.utils
import re
import time
import typing
from contextlib import asynccontextmanager, contextmanager
from functools import wraps
from random import random
import urllib.parse

import httpx

from .pydantic_utilities import pydantic_v1
from .request_options import RequestOptions
from .jsonable_encoder import jsonable_encoder
from .query_encoder import encode_query
from .remove_none_from_dict import remove_none_from_dict
from .file import convert_file_dict_to_httpx_tuples

INITIAL_RETRY_DELAY_SECONDS = 0.5
MAX_RETRY_DELAY_SECONDS = 10
MAX_RETRY_DELAY_SECONDS_FROM_HEADER = 30

# Generic to represent the underlying type of the HTTP response
T = typing.TypeVar("T")

def _parse_retry_after(response_headers: httpx.Headers) -> typing.Optional[float]:
    """
    This function parses the `Retry-After` header in a HTTP response and returns the number of seconds to wait.

    Inspired by the urllib3 retry implementation.
    """
    retry_after_ms = response_headers.get("retry-after-ms")
    if retry_after_ms is not None:
        try:
            return int(retry_after_ms) / 1000 if retry_after_ms > 0 else 0
        except Exception:
            pass

    retry_after = response_headers.get("retry-after")
    if retry_after is None:
        return None

    # Attempt to parse the header as an int.
    if re.match(r"^\s*[0-9]+\s*$", retry_after):
        seconds = float(retry_after)
    # Fallback to parsing it as a date.
    else:
        retry_date_tuple = email.utils.parsedate_tz(retry_after)
        if retry_date_tuple is None:
            return None
        if retry_date_tuple[9] is None:  # Python 2
            # Assume UTC if no timezone was specified
            # On Python2.7, parsedate_tz returns None for a timezone offset
            # instead of 0 if no timezone is given, where mktime_tz treats
            # a None timezone offset as local time.
            retry_date_tuple = retry_date_tuple[:9] + (0,) + retry_date_tuple[10:]

        retry_date = email.utils.mktime_tz(retry_date_tuple)
        seconds = retry_date - time.time()

    if seconds < 0:
        seconds = 0

    return seconds


def _retry_timeout(response: httpx.Response, retries: int) -> float:
    """
    Determine the amount of time to wait before retrying a request.
    This function begins by trying to parse a retry-after header from the response, and then proceeds to use exponential backoff
    with a jitter to determine the number of seconds to wait.
    """

    # If the API asks us to wait a certain amount of time (and it's a reasonable amount), just do what it says.
    retry_after = _parse_retry_after(response.headers)
    if retry_after is not None and retry_after <= MAX_RETRY_DELAY_SECONDS_FROM_HEADER:
        return retry_after

    # Apply exponential backoff, capped at MAX_RETRY_DELAY_SECONDS.
    retry_delay = min(INITIAL_RETRY_DELAY_SECONDS * pow(2.0, retries), MAX_RETRY_DELAY_SECONDS)

    # Add a randomness / jitter to the retry delay to avoid overwhelming the server with retries.
    timeout = retry_delay * (1 - 0.25 * random())
    return timeout if timeout >= 0 else 0


def _should_retry(response: httpx.Response) -> bool:
    retriable_400s = [429, 408, 409]
    return response.status_code >= 500 or response.status_code in retriable_400s


class HttpClient:
    def __init__(self, *, httpx_client: httpx.Client, base_url: typing.Optional[str], base_timeout: typing.Optional[int], base_headers: typing.Any):
        self.base_url = base_url
        self.base_timeout = base_timeout
        self.base_headers = base_headers
        self.httpx_client = httpx_client

    # Fix typing here to match httpx
    def request(
            self,
            path: str,
            *,
            method: str,
            response_type: typing.Type[T],
            base_url: typing.Optional[str],
            params: typing.Any,
            json: typing.Any,
            content: typing.Any,
            files: typing.Any,
            headers: typing.Any,
            request_options: RequestOptions,
            throws: typing.List[typing.Type],
            retries: int = 0
    ) -> T:
        base_url = self.base_url if base_url is None else base_url
        if base_url is None:
            raise ValueError("A base_url is required to make this request, please provide one and try again.")

        timeout = request_options.get("timeout_in_seconds") if request_options is not None and request_options.get("timeout_in_seconds") is not None else self.timeout
        
        # Add the input to each of these and do None-safety checks
        response = self.httpx_client.request(
            method=method,
            url=urllib.parse.urljoin(base_url, path),
            params=encode_query(
                jsonable_encoder(
                    request_options.get("additional_query_parameters") if request_options is not None else None
                )
            ),
            json=jsonable_encoder(json)
            if request_options is None or request_options.get("additional_body_parameters") is None
            else {
                **jsonable_encoder(json),
                **(jsonable_encoder(remove_none_from_dict(request_options.get("additional_body_parameters", {})))),
            },
            content=content,
            files=convert_file_dict_to_httpx_tuples(
                remove_none_from_dict(files)
            ),
            headers=jsonable_encoder(
                remove_none_from_dict(
                    {
                        **self.base_headers,
                        **(request_options.get("additional_headers", {}) if request_options is not None else {}),
                    }
                )
            ),
            timeout=timeout,
        )

        max_retries: int = request_options.get("max_retries") or 0 if request_options is not None else 0
        if _should_retry(response=response):
            if max_retries > retries:
                time.sleep(_retry_timeout(response=response, retries=retries))
                return self.request(
                    path=path,
                    method=method,
                    response_type=response_type,
                    base_url=base_url,
                    params=params,
                    json=json,
                    content=content,
                    files=files,
                    headers=headers,
                    request_options=request_options,
                    throws=throws,
                    retries=retries + 1
                )
        if 200 <= response.status_code < 300:
            return pydantic_v1.parse_obj_as(response_type, response.json())
        else:
            # Create a helper function to get the parsed exception
            raise Exception()

    @wraps(httpx.Client.stream)
    @contextmanager
    def stream(self, *args: typing.Any, max_retries: int = 0, retries: int = 0, **kwargs: typing.Any) -> typing.Any:
        with self.httpx_client.stream(*args, **kwargs) as stream:
            yield stream


class AsyncHttpClient:
    def __init__(self, *, httpx_client: httpx.AsyncClient):
        self.httpx_client = httpx_client

    # Ensure that the signature of the `request` method is the same as the `httpx.Client.request` method
    @wraps(httpx.AsyncClient.request)
    async def request(
        self, *args: typing.Any, max_retries: int = 0, retries: int = 0, **kwargs: typing.Any
    ) -> httpx.Response:
        response = await self.httpx_client.request(*args, **kwargs)
        if _should_retry(response=response):
            if max_retries > retries:
                await asyncio.sleep(_retry_timeout(response=response, retries=retries))
                return await self.request(max_retries=max_retries, retries=retries + 1, *args, **kwargs)
        return response

    @wraps(httpx.AsyncClient.stream)
    @asynccontextmanager
    async def stream(
        self, *args: typing.Any, max_retries: int = 0, retries: int = 0, **kwargs: typing.Any
    ) -> typing.Any:
        async with self.httpx_client.stream(*args, **kwargs) as stream:
            yield stream
