from pydantic import BaseModel


class TestCaseMetadata(BaseModel):
    id: str
    name: str
    hidden: bool
