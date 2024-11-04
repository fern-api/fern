from pydantic import BaseModel


class WithDocs(BaseModel):
    docs: str
