from pydantic import BaseModel


class ExceptionInfo(BaseModel):
    exception_type: str
    exception_message: str
    exception_stacktrace: str
