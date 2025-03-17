import typing
from typing import  Generic, TypeVar
from typing_extensions import ParamSpec # type: ignore

P = ParamSpec("P")
R = TypeVar("R")

class HttpResponse(Generic[R]):
    _headers: typing.Dict[str, str]
    _data: R

    def __init__(self, headers: typing.Dict[str, str], data: R):
        self._headers = headers
        self._data = data

    @property
    def headers(self) -> typing.Dict[str, str]:
        return self._headers

    @property
    def data(self) -> R:
        return self._data
