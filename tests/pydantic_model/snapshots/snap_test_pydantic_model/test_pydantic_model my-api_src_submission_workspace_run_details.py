import typing

import pydantic

from .exception_info import ExceptionInfo
from .exception_v2 import ExceptionV2


class WorkspaceRunDetails(pydantic.BaseModel):
    exception_v_2: typing.Optional[ExceptionV2] = pydantic.Field(alias="exceptionV2")
    exception: typing.Optional[ExceptionInfo]
    stdout: str

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
