from pydantic import BaseModel


class ImportingType(BaseModel):
    imported: str
