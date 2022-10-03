from __future__ import annotations

import typing

import pydantic
import typing_extensions

from .generic_create_problem_error import GenericCreateProblemError

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def generic(self, value: GenericCreateProblemError) -> CreateProblemError:
        return CreateProblemError(__root__=_CreateProblemError.Generic(**dict(value), error_type="generic"))


class CreateProblemError(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get(self) -> typing.Union[_CreateProblemError.Generic]:
        return self.__root__

    def visit(self, generic: typing.Callable[[GenericCreateProblemError], T_Result]) -> T_Result:
        if self.__root__.error_type == "generic":
            return generic(self.__root__)

    __root__: typing_extensions.Annotated[
        typing.Union[_CreateProblemError.Generic], pydantic.Field(discriminator="error_type")
    ]


class _CreateProblemError:
    class Generic(GenericCreateProblemError):
        error_type: typing_extensions.Literal["generic"] = pydantic.Field(alias="_type")

        class Config:
            allow_population_by_field_name = True


CreateProblemError.update_forward_refs()
