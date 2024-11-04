from pydantic import BaseModel


class NestedObjectWithLiterals(BaseModel):
    literal_1: str
    literal_2: str
    str_prop: str
