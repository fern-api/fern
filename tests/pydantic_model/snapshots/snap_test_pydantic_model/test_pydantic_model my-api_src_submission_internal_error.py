import typing

import pydantic

from .exception_info import ExceptionInfo


class InternalError(pydantic.BaseModel):
    exception_info: ExceptionInfo = pydantic.Field(alias="exceptionInfo")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
