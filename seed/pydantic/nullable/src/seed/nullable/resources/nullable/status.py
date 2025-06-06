# This file was auto-generated by Fern from our API Definition.

from __future__ import annotations

import datetime as dt
import typing

import pydantic
from ...core.pydantic_utilities import IS_PYDANTIC_V2, UniversalBaseModel


class Status_Active(UniversalBaseModel):
    type: typing.Literal["active"] = "active"

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="allow")  # type: ignore # Pydantic v2
    else:

        class Config:
            extra = pydantic.Extra.allow


class Status_Archived(UniversalBaseModel):
    value: typing.Optional[dt.datetime] = None
    type: typing.Literal["archived"] = "archived"


class Status_SoftDeleted(UniversalBaseModel):
    value: typing.Optional[dt.datetime] = None
    type: typing.Literal["soft-deleted"] = "soft-deleted"


Status = typing.Union[Status_Active, Status_Archived, Status_SoftDeleted]
