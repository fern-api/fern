from __future__ import annotations

import inspect
import typing

import typing_extensions

T = typing.TypeVar("T", bound=typing.Callable[..., typing.Any])

FERN_CONFIG_KEY = "__fern"


class RouteArgs(typing_extensions.TypedDict):
    openapi_extra: typing.Optional[typing.Dict[str, typing.Any]]


DEFAULT_ROUTE_ARGS = RouteArgs(openapi_extra=None)


def get_route_args(endpoint_function: typing.Callable[..., typing.Any]) -> RouteArgs:
    unwrapped = inspect.unwrap(endpoint_function, stop=(lambda f: hasattr(f, FERN_CONFIG_KEY)))
    return typing.cast(RouteArgs, getattr(unwrapped, FERN_CONFIG_KEY, DEFAULT_ROUTE_ARGS))


def route_args(openapi_extra: typing.Optional[typing.Dict[str, typing.Any]] = None) -> typing.Callable[[T], T]:
    """
    this decorator allows you to forward certain args to the FastAPI route decorator.

    usage:
        @route_args(openapi_extra=...)
        def your_endpoint_method(...

    currently supported args:
      - openapi_extra

    if there's another FastAPI route arg you need to pass through, please
    contact the Fern team!
    """

    def decorator(endpoint_function: T) -> T:
        setattr(endpoint_function, FERN_CONFIG_KEY, RouteArgs(openapi_extra=openapi_extra))
        return endpoint_function

    return decorator
