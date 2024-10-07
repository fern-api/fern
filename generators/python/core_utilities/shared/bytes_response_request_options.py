
from .request_options import RequestOptions

try:
    from typing import NotRequired  # type: ignore
except ImportError:
    from typing_extensions import NotRequired


class BytesResponseRequestOptions(RequestOptions):
    """
    Additional options for request-specific configuration when calling APIs that return streams of bytes
    via the SDK. This is used primarily as an optional final parameter for service functions.

    Attributes:
        - timeout_in_seconds: int. The number of seconds to await an API call before timing out.

        - max_retries: int. The max number of retries to attempt if the API call fails.

        - additional_headers: typing.Dict[str, typing.Any]. A dictionary containing additional parameters to spread into the request's header dict

        - additional_query_parameters: typing.Dict[str, typing.Any]. A dictionary containing additional parameters to spread into the request's query parameters dict

        - additional_body_parameters: typing.Dict[str, typing.Any]. A dictionary containing additional parameters to spread into the request's body parameters dict

        - chunk_size: int. The size, in bytes, to process each chunk of data being streamed back within the response. This equates to leveraging `chunk_size` within `requests` or `httpx`.
    """

    chunk_size: NotRequired[int]
