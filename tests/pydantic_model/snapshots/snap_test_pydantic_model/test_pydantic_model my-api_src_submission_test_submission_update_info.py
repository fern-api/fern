from __future__ import annotations

import typing

import pydantic
import typing_extensions

from .error_info import ErrorInfo
from .graded_test_case_update import GradedTestCaseUpdate
from .recorded_test_case_update import RecordedTestCaseUpdate
from .running_submission_state import RunningSubmissionState

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def running(self, value: RunningSubmissionState) -> TestSubmissionUpdateInfo:
        return TestSubmissionUpdateInfo(__root__=_TestSubmissionUpdateInfo.Running(type="running", running=value))

    def stopped(self) -> TestSubmissionUpdateInfo:
        return TestSubmissionUpdateInfo(__root__=_TestSubmissionUpdateInfo.Stopped(type="stopped"))

    def errored(self, value: ErrorInfo) -> TestSubmissionUpdateInfo:
        return TestSubmissionUpdateInfo(__root__=_TestSubmissionUpdateInfo.Errored(type="errored", errored=value))

    def graded_test_case(self, value: GradedTestCaseUpdate) -> TestSubmissionUpdateInfo:
        return TestSubmissionUpdateInfo(
            __root__=_TestSubmissionUpdateInfo.GradedTestCase(**dict(value), type="gradedTestCase")
        )

    def recorded_test_case(self, value: RecordedTestCaseUpdate) -> TestSubmissionUpdateInfo:
        return TestSubmissionUpdateInfo(
            __root__=_TestSubmissionUpdateInfo.RecordedTestCase(**dict(value), type="recordedTestCase")
        )

    def finished(self) -> TestSubmissionUpdateInfo:
        return TestSubmissionUpdateInfo(__root__=_TestSubmissionUpdateInfo.Finished(type="finished"))


class TestSubmissionUpdateInfo(pydantic.BaseModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    def get(
        self,
    ) -> typing.Union[
        _TestSubmissionUpdateInfo.Running,
        _TestSubmissionUpdateInfo.Stopped,
        _TestSubmissionUpdateInfo.Errored,
        _TestSubmissionUpdateInfo.GradedTestCase,
        _TestSubmissionUpdateInfo.RecordedTestCase,
        _TestSubmissionUpdateInfo.Finished,
    ]:
        return self.__root__

    def visit(
        self,
        running: typing.Callable[[RunningSubmissionState], T_Result],
        stopped: typing.Callable[[], T_Result],
        errored: typing.Callable[[ErrorInfo], T_Result],
        graded_test_case: typing.Callable[[GradedTestCaseUpdate], T_Result],
        recorded_test_case: typing.Callable[[RecordedTestCaseUpdate], T_Result],
        finished: typing.Callable[[], T_Result],
    ) -> T_Result:
        if self.__root__.type == "running":
            return running(self.__root__.running)
        if self.__root__.type == "stopped":
            return stopped()
        if self.__root__.type == "errored":
            return errored(self.__root__.errored)
        if self.__root__.type == "gradedTestCase":
            return graded_test_case(self.__root__)
        if self.__root__.type == "recordedTestCase":
            return recorded_test_case(self.__root__)
        if self.__root__.type == "finished":
            return finished()

    __root__: typing_extensions.Annotated[
        typing.Union[
            _TestSubmissionUpdateInfo.Running,
            _TestSubmissionUpdateInfo.Stopped,
            _TestSubmissionUpdateInfo.Errored,
            _TestSubmissionUpdateInfo.GradedTestCase,
            _TestSubmissionUpdateInfo.RecordedTestCase,
            _TestSubmissionUpdateInfo.Finished,
        ],
        pydantic.Field(discriminator="type"),
    ]


class _TestSubmissionUpdateInfo:
    class Running(pydantic.BaseModel):
        type: typing_extensions.Literal["running"]
        running: RunningSubmissionState

    class Stopped(pydantic.BaseModel):
        type: typing_extensions.Literal["stopped"]

    class Errored(pydantic.BaseModel):
        type: typing_extensions.Literal["errored"]
        errored: ErrorInfo

    class GradedTestCase(GradedTestCaseUpdate):
        type: typing_extensions.Literal["gradedTestCase"]

    class RecordedTestCase(RecordedTestCaseUpdate):
        type: typing_extensions.Literal["recordedTestCase"]

    class Finished(pydantic.BaseModel):
        type: typing_extensions.Literal["finished"]


TestSubmissionUpdateInfo.update_forward_refs()
