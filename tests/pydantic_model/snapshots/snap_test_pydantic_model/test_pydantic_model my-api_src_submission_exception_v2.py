from __future__ import annotations

import typing

import pydantic
import typing_extensions

from .exception_info import ExceptionInfo

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def generic(self, value: ExceptionInfo) -> ExceptionV2:
        return ExceptionV2(__root__=_ExceptionV2.Generic(**dict(value), type="generic"))

    def timeout(self) -> ExceptionV2:
        return ExceptionV2(__root__=_ExceptionV2.Timeout(type="timeout"))


class ExceptionV2(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get(self) -> typing.Union[_ExceptionV2.Generic, _ExceptionV2.Timeout]:
        return self.__root__

    def visit(
        self, generic: typing.Callable[[ExceptionInfo], T_Result], timeout: typing.Callable[[], T_Result]
    ) -> T_Result:
        if self.__root__.type == "generic":
            return generic(self.__root__)
        if self.__root__.type == "timeout":
            return timeout()

    __root__: typing_extensions.Annotated[
        typing.Union[_ExceptionV2.Generic, _ExceptionV2.Timeout], pydantic.Field(discriminator="type")
    ]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)


class _ExceptionV2:
    class Generic(ExceptionInfo):
        type: typing_extensions.Literal["generic"]

    class Timeout(pydantic.BaseModel):
        type: typing_extensions.Literal["timeout"]


ExceptionV2.update_forward_refs()
