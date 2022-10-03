from __future__ import annotations

import typing

import pydantic
import typing_extensions

from ...commons.language import Language
from .basic_custom_files import BasicCustomFiles
from .files import Files

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def basic(self, value: BasicCustomFiles) -> CustomFiles:
        return CustomFiles(__root__=_CustomFiles.Basic(**dict(value), type="basic"))

    def custom(self, value: typing.Dict[Language, Files]) -> CustomFiles:
        return CustomFiles(__root__=_CustomFiles.Custom(type="custom", custom=value))


class CustomFiles(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get(self) -> typing.Union[_CustomFiles.Basic, _CustomFiles.Custom]:
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


class _CustomFiles:
    class Basic(BasicCustomFiles):
        type: typing_extensions.Literal["basic"]

    class Custom(pydantic.BaseModel):
        type: typing_extensions.Literal["custom"]
        custom: typing.Dict[Language, Files]


CustomFiles.update_forward_refs()
