# This file was auto-generated by Fern from our API Definition.

from __future__ import annotations

import typing

import pydantic
from ...core.pydantic_utilities import IS_PYDANTIC_V2, UniversalBaseModel
from .error_info import ErrorInfo
from .running_submission_state import RunningSubmissionState
from .submission_status_for_test_case import SubmissionStatusForTestCase


class TestSubmissionStatus_Stopped(UniversalBaseModel):
    type: typing.Literal["stopped"] = "stopped"

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="allow", frozen=True)  # type: ignore # Pydantic v2
    else:

        class Config:
            frozen = True
            smart_union = True
            extra = pydantic.Extra.allow


class TestSubmissionStatus_Errored(UniversalBaseModel):
    value: ErrorInfo
    type: typing.Literal["errored"] = "errored"

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(frozen=True)  # type: ignore # Pydantic v2
    else:

        class Config:
            frozen = True
            smart_union = True


class TestSubmissionStatus_Running(UniversalBaseModel):
    value: RunningSubmissionState
    type: typing.Literal["running"] = "running"

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(frozen=True)  # type: ignore # Pydantic v2
    else:

        class Config:
            frozen = True
            smart_union = True


class TestSubmissionStatus_TestCaseIdToState(UniversalBaseModel):
    value: typing.Dict[str, SubmissionStatusForTestCase]
    type: typing.Literal["testCaseIdToState"] = "testCaseIdToState"

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(frozen=True)  # type: ignore # Pydantic v2
    else:

        class Config:
            frozen = True
            smart_union = True


TestSubmissionStatus = typing.Union[
    TestSubmissionStatus_Stopped,
    TestSubmissionStatus_Errored,
    TestSubmissionStatus_Running,
    TestSubmissionStatus_TestCaseIdToState,
]
