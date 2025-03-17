import functools
import typing
from typing import Any, cast, Generic, TypeVar
from typing_extensions import ParamSpec # type: ignore

P = ParamSpec("P")
R = TypeVar("R")

class APIResponse(Generic[R]):
    headers: typing.Dict[str, str]
    data: R

    def __init__(self, headers: typing.Dict[str, str], data: R):
        self.headers = headers
        self.data = data

def wrap_func_to_exclude_raw_response(func: typing.Callable[P, APIResponse[R]]) -> typing.Callable[P, R]:
    """
    Wraps a function that returns APIResponse to instead return just the data portion.
    This is used to define methods with a more concise API.
    """
    @functools.wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        response = func(*args, **kwargs)
        return response.data
    
    return wrapper

def wrap_async_func_to_exclude_raw_response(func: typing.Callable[P, typing.Awaitable[APIResponse[R]]]) -> typing.Callable[P, typing.Awaitable[R]]:
    """
    Wraps an async function that returns APIResponse to instead return just the data portion.
    This is used to define methods with a more concise API.
    """
    @functools.wraps(func)
    async def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        response = await func(*args, **kwargs)
        return response.data
    
    return wrapper