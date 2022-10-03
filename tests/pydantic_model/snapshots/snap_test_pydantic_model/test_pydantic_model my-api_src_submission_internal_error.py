import pydantic

from .exception_info import ExceptionInfo


class InternalError(pydantic.BaseModel):
    exception_info: ExceptionInfo = pydantic.Field(alias="exceptionInfo")

    class Config:
        allow_population_by_field_name = True
