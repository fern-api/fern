from __future__ import annotations

import typing

import pydantic


class HttpEndpointId(pydantic.BaseModel):
    __root__: str

    def get_as_str(self) -> str:
        return self.__root__

    def from_str(self, value: str) -> HttpEndpointId:
        return HttpEndpointId(__root__=value)

    @pydantic.root_validator
    def _validate(cls, values: typing.Dict[str, typing.Any]) -> typing.Dict[str, typing.Any]:
        value = typing.cast(str, values.get("__root__"))
        for validator in HttpEndpointId.Validators._validators:
            value = validator(value)
        return {**values, "__root__": value}

    class Validators:
        _validators: typing.ClassVar[typing.List[typing.Callable[[str], str]]] = []

        @classmethod
        def validate(cls, validator: typing.Callable[[str], str]) -> None:
            cls._validators.append(validator)

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
