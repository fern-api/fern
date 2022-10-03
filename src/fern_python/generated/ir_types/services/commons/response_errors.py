import typing

import pydantic

from .response_error import ResponseError


class ResponseErrors(pydantic.BaseModel):
    __root__: typing.List[ResponseError]

    def get_value(self) -> typing.List[ResponseError]:
        return self.__root__

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)
