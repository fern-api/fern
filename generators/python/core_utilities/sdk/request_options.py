import typing

try:
    from typing import NotRequired  # type: ignore
except ImportError:
    from typing_extensions import NotRequired  # type: ignore


class RequestOptions(typing.TypedDict):
    timeout_in_seconds: NotRequired[int]
    additional_headers: NotRequired[typing.Dict[str, typing.Any]]
    additional_query_parameters: NotRequired[typing.Dict[str, typing.Any]]
    additional_body_parameters: NotRequired[typing.Dict[str, typing.Any]]
