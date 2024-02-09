import typing

try:
    import pydantic.v1 as pydantic  # type: ignore
except ImportError:
    import pydantic  # type: ignore


class RequestOptions(pydantic.BaseModel):
    timeout_in_seconds: typing.Optional[int] = None
    additional_headers: typing.Dict[str, typing.Any] = {}
    additional_query_parameters: typing.Dict[str, typing.Any] = {}
    additional_body_parameters: typing.Dict[str, typing.Any] = {}
