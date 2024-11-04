from pydantic import BaseModel


class ExceptionInfo(BaseModel):
    exception_type: str = Field(alias="exceptionType")
    exception_message: str = Field(alias="exceptionMessage")
    exception_stacktrace: str = Field(alias="exceptionStacktrace")
