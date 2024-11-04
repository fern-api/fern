from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class Moment(BaseModel):
    id: UUID
    date: str
    datetime: datetime
