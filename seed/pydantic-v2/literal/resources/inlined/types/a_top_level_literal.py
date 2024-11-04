from pydantic import BaseModel
from resources.inlined.types import ANestedLiteral


class ATopLevelLiteral(BaseModel):
    nested_literal: ANestedLiteral
