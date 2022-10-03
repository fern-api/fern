from __future__ import annotations

import typing

import pydantic
import typing_extensions

from ..commons.variable_value import VariableValue
from .exception_info import ExceptionInfo
from .exception_v2 import ExceptionV2

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def value(self, value: VariableValue) -> ActualResult:
        return ActualResult(__root__=_ActualResult.Value(type="value", value=value))

    def exception(self, value: ExceptionInfo) -> ActualResult:
        return ActualResult(__root__=_ActualResult.Exception(**dict(value), type="exception"))

    def exception_v_2(self, value: ExceptionV2) -> ActualResult:
        return ActualResult(__root__=_ActualResult.ExceptionV2(type="exceptionV2", exception_v_2=value))


class ActualResult(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get(self) -> typing.Union[_ActualResult.Value, _ActualResult.Exception, _ActualResult.ExceptionV2]:
        return self.__root__

    def visit(
        self,
        value: typing.Callable[[VariableValue], T_Result],
        exception: typing.Callable[[ExceptionInfo], T_Result],
        exception_v_2: typing.Callable[[ExceptionV2], T_Result],
    ) -> T_Result:
        if self.__root__.type == "value":
            return value(self.__root__.value)
        if self.__root__.type == "exception":
            return exception(self.__root__)
        if self.__root__.type == "exceptionV2":
            return exception_v_2(self.__root__.exception_v_2)

    __root__: typing_extensions.Annotated[
        typing.Union[_ActualResult.Value, _ActualResult.Exception, _ActualResult.ExceptionV2],
        pydantic.Field(discriminator="type"),
    ]


class _ActualResult:
    class Value(pydantic.BaseModel):
        type: typing_extensions.Literal["value"]
        value: VariableValue

    class Exception(ExceptionInfo):
        type: typing_extensions.Literal["exception"]

    class ExceptionV2(pydantic.BaseModel):
        type: typing_extensions.Literal["exceptionV2"]
        exception_v_2: ExceptionV2 = pydantic.Field(alias="exceptionV2")

        class Config:
            allow_population_by_field_name = True


ActualResult.update_forward_refs()
