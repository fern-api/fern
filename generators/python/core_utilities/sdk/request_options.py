import typing

try:
    import NotRequired from typing  # type: ignore
except ImportError:
    import NotRequired from typing_extensions  # type: ignore


class RequestOptions(typing.TypedDict):
    timeout_in_seconds: NotRequired[int]
    max_retries: NotRequired[int]
    additional_headers: NotRequired[typing.Dict[str, typing.Any]]
    additional_query_parameters: NotRequired[typing.Dict[str, typing.Any]]
    additional_body_parameters: NotRequired[typing.Dict[str, typing.Any]]
