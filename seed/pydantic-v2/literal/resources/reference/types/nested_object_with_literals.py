from pydantic import BaseModel


class NestedObjectWithLiterals(BaseModel):
    literal_1: str = Field(alias="literal1")
    literal_2: str = Field(alias="literal2")
    str_prop: str = Field(alias="strProp")
