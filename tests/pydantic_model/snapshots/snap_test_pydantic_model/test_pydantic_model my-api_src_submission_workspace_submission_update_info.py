from __future__ import annotations

import typing

import pydantic
import typing_extensions

from .error_info import ErrorInfo
from .running_submission_state import RunningSubmissionState
from .workspace_run_details import WorkspaceRunDetails
from .workspace_traced_update import WorkspaceTracedUpdate

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def running(self, value: RunningSubmissionState) -> WorkspaceSubmissionUpdateInfo:
        return WorkspaceSubmissionUpdateInfo(
            __root__=_WorkspaceSubmissionUpdateInfo.Running(type="running", running=value)
        )

    def ran(self, value: WorkspaceRunDetails) -> WorkspaceSubmissionUpdateInfo:
        return WorkspaceSubmissionUpdateInfo(__root__=_WorkspaceSubmissionUpdateInfo.Ran(**dict(value), type="ran"))

    def stopped(self) -> WorkspaceSubmissionUpdateInfo:
        return WorkspaceSubmissionUpdateInfo(__root__=_WorkspaceSubmissionUpdateInfo.Stopped(type="stopped"))

    def traced(self) -> WorkspaceSubmissionUpdateInfo:
        return WorkspaceSubmissionUpdateInfo(__root__=_WorkspaceSubmissionUpdateInfo.Traced(type="traced"))

    def traced_v_2(self, value: WorkspaceTracedUpdate) -> WorkspaceSubmissionUpdateInfo:
        return WorkspaceSubmissionUpdateInfo(
            __root__=_WorkspaceSubmissionUpdateInfo.TracedV2(**dict(value), type="tracedV2")
        )

    def errored(self, value: ErrorInfo) -> WorkspaceSubmissionUpdateInfo:
        return WorkspaceSubmissionUpdateInfo(
            __root__=_WorkspaceSubmissionUpdateInfo.Errored(type="errored", errored=value)
        )

    def finished(self) -> WorkspaceSubmissionUpdateInfo:
        return WorkspaceSubmissionUpdateInfo(__root__=_WorkspaceSubmissionUpdateInfo.Finished(type="finished"))


class WorkspaceSubmissionUpdateInfo(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get(
        self,
    ) -> typing.Union[
        _WorkspaceSubmissionUpdateInfo.Running,
        _WorkspaceSubmissionUpdateInfo.Ran,
        _WorkspaceSubmissionUpdateInfo.Stopped,
        _WorkspaceSubmissionUpdateInfo.Traced,
        _WorkspaceSubmissionUpdateInfo.TracedV2,
        _WorkspaceSubmissionUpdateInfo.Errored,
        _WorkspaceSubmissionUpdateInfo.Finished,
    ]:
        return self.__root__

    def visit(
        self,
        running: typing.Callable[[RunningSubmissionState], T_Result],
        ran: typing.Callable[[WorkspaceRunDetails], T_Result],
        stopped: typing.Callable[[], T_Result],
        traced: typing.Callable[[], T_Result],
        traced_v_2: typing.Callable[[WorkspaceTracedUpdate], T_Result],
        errored: typing.Callable[[ErrorInfo], T_Result],
        finished: typing.Callable[[], T_Result],
    ) -> T_Result:
        if self.__root__.type == "running":
            return running(self.__root__.running)
        if self.__root__.type == "ran":
            return ran(self.__root__)
        if self.__root__.type == "stopped":
            return stopped()
        if self.__root__.type == "traced":
            return traced()
        if self.__root__.type == "tracedV2":
            return traced_v_2(self.__root__)
        if self.__root__.type == "errored":
            return errored(self.__root__.errored)
        if self.__root__.type == "finished":
            return finished()

    __root__: typing_extensions.Annotated[
        typing.Union[
            _WorkspaceSubmissionUpdateInfo.Running,
            _WorkspaceSubmissionUpdateInfo.Ran,
            _WorkspaceSubmissionUpdateInfo.Stopped,
            _WorkspaceSubmissionUpdateInfo.Traced,
            _WorkspaceSubmissionUpdateInfo.TracedV2,
            _WorkspaceSubmissionUpdateInfo.Errored,
            _WorkspaceSubmissionUpdateInfo.Finished,
        ],
        pydantic.Field(discriminator="type"),
    ]


class _WorkspaceSubmissionUpdateInfo:
    class Running(pydantic.BaseModel):
        type: typing_extensions.Literal["running"]
        running: RunningSubmissionState

    class Ran(WorkspaceRunDetails):
        type: typing_extensions.Literal["ran"]

    class Stopped(pydantic.BaseModel):
        type: typing_extensions.Literal["stopped"]

    class Traced(pydantic.BaseModel):
        type: typing_extensions.Literal["traced"]

    class TracedV2(WorkspaceTracedUpdate):
        type: typing_extensions.Literal["tracedV2"]

    class Errored(pydantic.BaseModel):
        type: typing_extensions.Literal["errored"]
        errored: ErrorInfo

    class Finished(pydantic.BaseModel):
        type: typing_extensions.Literal["finished"]


WorkspaceSubmissionUpdateInfo.update_forward_refs()
