from pydantic import BaseModel
from typing import Optional


class UploadResponse(BaseModel):
    count: Optional[int] = None
