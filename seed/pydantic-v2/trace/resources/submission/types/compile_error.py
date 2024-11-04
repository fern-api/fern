from pydantic import BaseModel


class CompileError(BaseModel):
    message: str
