from pydantic import BaseModel
from typing import Optional


class FunctionImplementation(BaseModel):
    impl: str
    imports: Optional[str] = None
