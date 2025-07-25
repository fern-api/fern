# This file was auto-generated by Fern from our API Definition.

import typing

import pydantic
import typing_extensions
from ....core.pydantic_utilities import IS_PYDANTIC_V2, UniversalBaseModel
from ....core.serialization import FieldMetadata
from .object_with_optional_field import ObjectWithOptionalField


class NestedObjectWithRequiredField(UniversalBaseModel):
    string: str
    nested_object: typing_extensions.Annotated[ObjectWithOptionalField, FieldMetadata(alias="NestedObject")]

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(frozen=True)  # type: ignore # Pydantic v2
    else:

        class Config:
            frozen = True
            smart_union = True
            extra = pydantic.Extra.ignore
