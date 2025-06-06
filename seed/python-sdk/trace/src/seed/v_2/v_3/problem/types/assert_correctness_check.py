# This file was auto-generated by Fern from our API Definition.

from __future__ import annotations

import typing

import pydantic
import typing_extensions
from .....core.pydantic_utilities import IS_PYDANTIC_V2, UniversalBaseModel, update_forward_refs
from .....core.serialization import FieldMetadata
from .function_implementation_for_multiple_languages import FunctionImplementationForMultipleLanguages
from .parameter import Parameter
from .parameter_id import ParameterId


class AssertCorrectnessCheck_DeepEquality(UniversalBaseModel):
    type: typing.Literal["deepEquality"] = "deepEquality"
    expected_value_parameter_id: typing_extensions.Annotated[
        ParameterId, FieldMetadata(alias="expectedValueParameterId")
    ]

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="allow", frozen=True)  # type: ignore # Pydantic v2
    else:

        class Config:
            frozen = True
            smart_union = True
            extra = pydantic.Extra.allow


class AssertCorrectnessCheck_Custom(UniversalBaseModel):
    type: typing.Literal["custom"] = "custom"
    additional_parameters: typing_extensions.Annotated[
        typing.List[Parameter], FieldMetadata(alias="additionalParameters")
    ]
    code: FunctionImplementationForMultipleLanguages

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="allow", frozen=True)  # type: ignore # Pydantic v2
    else:

        class Config:
            frozen = True
            smart_union = True
            extra = pydantic.Extra.allow


from .....commons.types.list_type import ListType  # noqa: E402, F401, I001
from .....commons.types.map_type import MapType  # noqa: E402, F401, I001

AssertCorrectnessCheck = typing.Union[AssertCorrectnessCheck_DeepEquality, AssertCorrectnessCheck_Custom]
update_forward_refs(AssertCorrectnessCheck_Custom)
