from __future__ import annotations

import typing

import pydantic
import typing_extensions

from .error_info import ErrorInfo
from .running_submission_state import RunningSubmissionState
from .workspace_run_details import WorkspaceRunDetails

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def stopped(self) -> WorkspaceSubmissionStatus:
        return WorkspaceSubmissionStatus(__root__=_WorkspaceSubmissionStatus.Stopped(type="stopped"))

    def errored(self, value: ErrorInfo) -> WorkspaceSubmissionStatus:
        return WorkspaceSubmissionStatus(__root__=_WorkspaceSubmissionStatus.Errored(type="errored", value=value))

    def running(self, value: RunningSubmissionState) -> WorkspaceSubmissionStatus:
        return WorkspaceSubmissionStatus(__root__=_WorkspaceSubmissionStatus.Running(type="running", value=value))

    def ran(self, value: WorkspaceRunDetails) -> WorkspaceSubmissionStatus:
        return WorkspaceSubmissionStatus(__root__=_WorkspaceSubmissionStatus.Ran(**dict(value), type="ran"))

    def traced(self, value: WorkspaceRunDetails) -> WorkspaceSubmissionStatus:
        return WorkspaceSubmissionStatus(__root__=_WorkspaceSubmissionStatus.Traced(**dict(value), type="traced"))


class WorkspaceSubmissionStatus(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get_as_union(
        self,
    ) -> typing.Union[
        _WorkspaceSubmissionStatus.Stopped,
        _WorkspaceSubmissionStatus.Errored,
        _WorkspaceSubmissionStatus.Running,
        _WorkspaceSubmissionStatus.Ran,
        _WorkspaceSubmissionStatus.Traced,
    ]:
        return self.__root__

    def visit(
        self,
        stopped: typing.Callable[[], T_Result],
        errored: typing.Callable[[ErrorInfo], T_Result],
        running: typing.Callable[[RunningSubmissionState], T_Result],
        ran: typing.Callable[[WorkspaceRunDetails], T_Result],
        traced: typing.Callable[[WorkspaceRunDetails], T_Result],
    ) -> T_Result:
        if self.__root__.type == "stopped":
            return stopped()
        if self.__root__.type == "errored":
            return errored(self.__root__.errored)
        if self.__root__.type == "running":
            return running(self.__root__.running)
        if self.__root__.type == "ran":
            return ran(self.__root__)
        if self.__root__.type == "traced":
            return traced(self.__root__)

    __root__: typing_extensions.Annotated[
        typing.Union[
            _WorkspaceSubmissionStatus.Stopped,
            _WorkspaceSubmissionStatus.Errored,
            _WorkspaceSubmissionStatus.Running,
            _WorkspaceSubmissionStatus.Ran,
            _WorkspaceSubmissionStatus.Traced,
        ],
        pydantic.Field(discriminator="type"),
    ]

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True


class _WorkspaceSubmissionStatus:
    class Stopped(pydantic.BaseModel):
        type: typing_extensions.Literal["stopped"]

        class Config:
            frozen = True

    class Errored(pydantic.BaseModel):
        type: typing_extensions.Literal["errored"]
        value: ErrorInfo

        class Config:
            frozen = True

    class Running(pydantic.BaseModel):
        type: typing_extensions.Literal["running"]
        value: RunningSubmissionState

        class Config:
            frozen = True

    class Ran(WorkspaceRunDetails):
        type: typing_extensions.Literal["ran"]

        class Config:
            frozen = True

    class Traced(WorkspaceRunDetails):
        type: typing_extensions.Literal["traced"]

        class Config:
            frozen = True


WorkspaceSubmissionStatus.update_forward_refs()
