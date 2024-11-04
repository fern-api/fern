from pydantic import BaseModel


class ANestedLiteral(BaseModel):
    my_literal: str
