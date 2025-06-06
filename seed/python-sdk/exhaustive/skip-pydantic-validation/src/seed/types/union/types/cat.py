# This file was auto-generated by Fern from our API Definition.

import typing

import pydantic
import typing_extensions
from ....core.pydantic_utilities import IS_PYDANTIC_V2
from ....core.serialization import FieldMetadata
from ....core.unchecked_base_model import UncheckedBaseModel


class Cat(UncheckedBaseModel):
    name: str
    likes_to_meow: typing_extensions.Annotated[bool, FieldMetadata(alias="likesToMeow")]

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="allow", frozen=True)  # type: ignore # Pydantic v2
    else:

        class Config:
            frozen = True
            smart_union = True
            extra = pydantic.Extra.allow
