from __future__ import annotations

import typing

import pydantic
import typing_extensions

from .test_submission_status_v2 import TestSubmissionStatusV2
from .workspace_submission_status_v2 import WorkspaceSubmissionStatusV2

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def test(self, value: TestSubmissionStatusV2) -> SubmissionStatusV2:
        return SubmissionStatusV2(__root__=_SubmissionStatusV2.Test(**dict(value), type="test"))

    def workspace(self, value: WorkspaceSubmissionStatusV2) -> SubmissionStatusV2:
        return SubmissionStatusV2(__root__=_SubmissionStatusV2.Workspace(**dict(value), type="workspace"))


class SubmissionStatusV2(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get(self) -> typing.Union[_SubmissionStatusV2.Test, _SubmissionStatusV2.Workspace]:
        return self.__root__

    def visit(
        self,
        test: typing.Callable[[TestSubmissionStatusV2], T_Result],
        workspace: typing.Callable[[WorkspaceSubmissionStatusV2], T_Result],
    ) -> T_Result:
        if self.__root__.type == "test":
            return test(self.__root__)
        if self.__root__.type == "workspace":
            return workspace(self.__root__)

    __root__: typing_extensions.Annotated[
        typing.Union[_SubmissionStatusV2.Test, _SubmissionStatusV2.Workspace], pydantic.Field(discriminator="type")
    ]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)


class _SubmissionStatusV2:
    class Test(TestSubmissionStatusV2):
        type: typing_extensions.Literal["test"]

    class Workspace(WorkspaceSubmissionStatusV2):
        type: typing_extensions.Literal["workspace"]


SubmissionStatusV2.update_forward_refs()
