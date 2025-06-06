# This file was auto-generated by Fern from our API Definition.

from __future__ import annotations

import typing

import pydantic
import typing_extensions
from ...core.pydantic_utilities import IS_PYDANTIC_V2, UniversalBaseModel, update_forward_refs
from ...core.serialization import FieldMetadata
from .test_case_grade import TestCaseGrade
from .test_case_result import TestCaseResult
from .test_case_result_with_stdout import TestCaseResultWithStdout


class SubmissionStatusForTestCase_Graded(UniversalBaseModel):
    type: typing.Literal["graded"] = "graded"
    result: TestCaseResult
    stdout: str

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="allow", frozen=True)  # type: ignore # Pydantic v2
    else:

        class Config:
            frozen = True
            smart_union = True
            extra = pydantic.Extra.allow


class SubmissionStatusForTestCase_GradedV2(UniversalBaseModel):
    value: TestCaseGrade
    type: typing.Literal["gradedV2"] = "gradedV2"

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(frozen=True)  # type: ignore # Pydantic v2
    else:

        class Config:
            frozen = True
            smart_union = True


class SubmissionStatusForTestCase_Traced(UniversalBaseModel):
    type: typing.Literal["traced"] = "traced"
    result: TestCaseResultWithStdout
    trace_responses_size: typing_extensions.Annotated[int, FieldMetadata(alias="traceResponsesSize")]

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="allow", frozen=True)  # type: ignore # Pydantic v2
    else:

        class Config:
            frozen = True
            smart_union = True
            extra = pydantic.Extra.allow


from ...commons.types.key_value_pair import KeyValuePair  # noqa: E402, F401, I001
from ...commons.types.map_value import MapValue  # noqa: E402, F401, I001

SubmissionStatusForTestCase = typing.Union[
    SubmissionStatusForTestCase_Graded, SubmissionStatusForTestCase_GradedV2, SubmissionStatusForTestCase_Traced
]
update_forward_refs(SubmissionStatusForTestCase_Graded)
update_forward_refs(SubmissionStatusForTestCase_Traced)
