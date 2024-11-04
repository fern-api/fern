from pydantic import BaseModel
from resources.inlined.types.a_nested_literal import ANestedLiteral


class ATopLevelLiteral(BaseModel):
    nested_literal: ANestedLiteral = Field(alias="nestedLiteral")
