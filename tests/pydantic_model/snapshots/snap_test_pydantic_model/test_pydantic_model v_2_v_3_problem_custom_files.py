from __future__ import annotations

import typing

import pydantic
import typing_extensions

from ....commons.language import Language
from .basic_custom_files import BasicCustomFiles
from .files import Files

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def basic(self, value: BasicCustomFiles) -> CustomFiles:
        return CustomFiles(__root__=_CustomFiles.Basic(**dict(value), type="basic"))

    def custom(self, value: typing.Dict[Language, Files]) -> CustomFiles:
        return CustomFiles(__root__=_CustomFiles.Custom(type="custom", value=value))


class CustomFiles(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get_as_union(self) -> typing.Union[_CustomFiles.Basic, _CustomFiles.Custom]:
        return self.__root__

    def visit(
        self,
        basic: typing.Callable[[BasicCustomFiles], T_Result],
        custom: typing.Callable[[typing.Dict[Language, Files]], T_Result],
    ) -> T_Result:
        if self.__root__.type == "basic":
            return basic(self.__root__)
        if self.__root__.type == "custom":
            return custom(self.__root__.custom)

    __root__: typing_extensions.Annotated[
        typing.Union[_CustomFiles.Basic, _CustomFiles.Custom], pydantic.Field(discriminator="type")
    ]

    @pydantic.root_validator
    def _validate(cls, values: typing.Dict[str, typing.Any]) -> typing.Dict[str, typing.Any]:
        value = typing.cast(typing.Union[_CustomFiles.Basic, _CustomFiles.Custom], values.get("__root__"))
        for validator in CustomFiles.Validators._validators:
            value = validator(value)
        return {**values, "__root__": value}

    class Validators:
        _validators: typing.ClassVar[
            typing.List[
                typing.Callable[
                    [typing.Union[_CustomFiles.Basic, _CustomFiles.Custom]],
                    typing.Union[_CustomFiles.Basic, _CustomFiles.Custom],
                ]
            ]
        ] = []

        @classmethod
        def validate(
            cls,
            validator: typing.Callable[
                [typing.Union[_CustomFiles.Basic, _CustomFiles.Custom]],
                typing.Union[_CustomFiles.Basic, _CustomFiles.Custom],
            ],
        ) -> None:
            cls._validators.append(validator)

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True


class _CustomFiles:
    class Basic(BasicCustomFiles):
        type: typing_extensions.Literal["basic"]

        class Config:
            frozen = True

    class Custom(pydantic.BaseModel):
        type: typing_extensions.Literal["custom"]
        value: typing.Dict[Language, Files]

        class Config:
            frozen = True


CustomFiles.update_forward_refs()
