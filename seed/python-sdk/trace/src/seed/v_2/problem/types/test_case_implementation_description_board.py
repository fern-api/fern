# This file was auto-generated by Fern from our API Definition.

from __future__ import annotations

import typing

import pydantic
from ....core.pydantic_utilities import IS_PYDANTIC_V2, UniversalBaseModel
from .parameter_id import ParameterId


class TestCaseImplementationDescriptionBoard_Html(UniversalBaseModel):
    value: str
    type: typing.Literal["html"] = "html"

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(frozen=True)  # type: ignore # Pydantic v2
    else:

        class Config:
            frozen = True
            smart_union = True


class TestCaseImplementationDescriptionBoard_ParamId(UniversalBaseModel):
    value: ParameterId
    type: typing.Literal["paramId"] = "paramId"

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(frozen=True)  # type: ignore # Pydantic v2
    else:

        class Config:
            frozen = True
            smart_union = True


TestCaseImplementationDescriptionBoard = typing.Union[
    TestCaseImplementationDescriptionBoard_Html, TestCaseImplementationDescriptionBoard_ParamId
]
