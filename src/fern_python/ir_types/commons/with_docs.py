from typing import Optional

from pydantic import BaseModel


class WithDocs(BaseModel):
    docs: Optional[str]
