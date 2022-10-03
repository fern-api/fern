from __future__ import annotations

import typing

import pydantic
import typing_extensions

from ..commons.problem_id import ProblemId
from .create_problem_error import CreateProblemError

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def success(self, value: ProblemId) -> CreateProblemResponse:
        return CreateProblemResponse(__root__=_CreateProblemResponse.Success(type="success", success=value))

    def error(self, value: CreateProblemError) -> CreateProblemResponse:
        return CreateProblemResponse(__root__=_CreateProblemResponse.Error(type="error", error=value))


class CreateProblemResponse(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get(self) -> typing.Union[_CreateProblemResponse.Success, _CreateProblemResponse.Error]:
        return self.__root__

    def visit(
        self, success: typing.Callable[[ProblemId], T_Result], error: typing.Callable[[CreateProblemError], T_Result]
    ) -> T_Result:
        if self.__root__.type == "success":
            return success(self.__root__.success)
        if self.__root__.type == "error":
            return error(self.__root__.error)

    __root__: typing_extensions.Annotated[
        typing.Union[_CreateProblemResponse.Success, _CreateProblemResponse.Error], pydantic.Field(discriminator="type")
    ]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)


class _CreateProblemResponse:
    class Success(pydantic.BaseModel):
        type: typing_extensions.Literal["success"]
        success: ProblemId

    class Error(pydantic.BaseModel):
        type: typing_extensions.Literal["error"]
        error: CreateProblemError


CreateProblemResponse.update_forward_refs()
