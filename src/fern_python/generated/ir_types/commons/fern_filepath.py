from __future__ import annotations

import typing

import pydantic

from .string_with_all_casings import StringWithAllCasings


class FernFilepath(pydantic.BaseModel):
    __root__: typing.List[StringWithAllCasings]

    def get_as_list(self) -> typing.List[StringWithAllCasings]:
        return self.__root__

    def from_list(self, value: typing.List[StringWithAllCasings]) -> FernFilepath:
        return FernFilepath(__root__=value)

    @pydantic.root_validator
    def _validate(cls, values: typing.Dict[str, typing.Any]) -> typing.Dict[str, typing.Any]:
        value = typing.cast(typing.List[StringWithAllCasings], values.get("__root__"))
        for validator in FernFilepath.Validators._validators:
            value = validator(value)
        return {**values, "__root__": value}

    class Validators:
        _validators: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[StringWithAllCasings]], typing.List[StringWithAllCasings]]]
        ] = []

        @classmethod
        def add_validator(
            cls, validator: typing.Callable[[typing.List[StringWithAllCasings]], typing.List[StringWithAllCasings]]
        ) -> None:
            cls._validators.append(validator)

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
