from __future__ import annotations

import typing

import pydantic

from .response_error import ResponseError


class ResponseErrors(pydantic.BaseModel):
    __root__: typing.List[ResponseError]

    def get_as_list(self) -> typing.List[ResponseError]:
        return self.__root__

    def from_list(self, value: typing.List[ResponseError]) -> ResponseErrors:
        return ResponseErrors(__root__=value)

    @pydantic.root_validator
    def _validate(cls, values: typing.Dict[str, typing.Any]) -> typing.Dict[str, typing.Any]:
        value = typing.cast(typing.List[ResponseError], values.get("__root__"))
        for validator in ResponseErrors.Validators._validators:
            value = validator(value)
        return {**values, "__root__": value}

    class Validators:
        _validators: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[ResponseError]], typing.List[ResponseError]]]
        ] = []

        @classmethod
        def validate(cls, validator: typing.Callable[[typing.List[ResponseError]], typing.List[ResponseError]]) -> None:
            cls._validators.append(validator)

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
