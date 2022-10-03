from __future__ import annotations

import typing

import pydantic
import typing_extensions

from .test_submission_state import TestSubmissionState
from .workspace_submission_state import WorkspaceSubmissionState

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def test(self, value: TestSubmissionState) -> SubmissionTypeState:
        return SubmissionTypeState(__root__=_SubmissionTypeState.Test(**dict(value), type="test"))

    def workspace(self, value: WorkspaceSubmissionState) -> SubmissionTypeState:
        return SubmissionTypeState(__root__=_SubmissionTypeState.Workspace(**dict(value), type="workspace"))


class SubmissionTypeState(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get(self) -> typing.Union[_SubmissionTypeState.Test, _SubmissionTypeState.Workspace]:
        return self.__root__

    def visit(
        self,
        test: typing.Callable[[TestSubmissionState], T_Result],
        workspace: typing.Callable[[WorkspaceSubmissionState], T_Result],
    ) -> T_Result:
        if self.__root__.type == "test":
            return test(self.__root__)
        if self.__root__.type == "workspace":
            return workspace(self.__root__)

    __root__: typing_extensions.Annotated[
        typing.Union[_SubmissionTypeState.Test, _SubmissionTypeState.Workspace], pydantic.Field(discriminator="type")
    ]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)


class _SubmissionTypeState:
    class Test(TestSubmissionState):
        type: typing_extensions.Literal["test"]

    class Workspace(WorkspaceSubmissionState):
        type: typing_extensions.Literal["workspace"]


SubmissionTypeState.update_forward_refs()
