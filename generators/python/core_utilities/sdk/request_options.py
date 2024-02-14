import typing

try:
    from typing import NotRequired  # type: ignore
except ImportError:
    from typing_extensions import NotRequired  # type: ignore

"""
Additional options for request-specific configuration when calling APIs via the SDK.
This is used primarily as an optional final parameter for service functions.

Attributes:
    - timeout_in_seconds: int. The number of seconds to await an API call before timing out.

    - additional_headers: typing.Dict[str, typing.Any]. A dictionary containing additional parameters to spread into the request's header dict

    - additional_query_parameters: typing.Dict[str, typing.Any]. A dictionary containing additional parameters to spread into the request's query parameters dict

    - additional_body_parameters: typing.Dict[str, typing.Any]. A dictionary containing additional parameters to spread into the request's body parameters dict
"""
class RequestOptions(typing.TypedDict):
    timeout_in_seconds: NotRequired[int]
    additional_headers: NotRequired[typing.Dict[str, typing.Any]]
    additional_query_parameters: NotRequired[typing.Dict[str, typing.Any]]
    additional_body_parameters: NotRequired[typing.Dict[str, typing.Any]]
