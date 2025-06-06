# This file was auto-generated by Fern from our API Definition.

import pydantic
from ......core.pydantic_utilities import UniversalBaseModel


class Cat(UniversalBaseModel):
    name: str
    likes_to_meow: bool = pydantic.Field(alias="likesToMeow")

    class Config:
        extra = pydantic.Extra.forbid
