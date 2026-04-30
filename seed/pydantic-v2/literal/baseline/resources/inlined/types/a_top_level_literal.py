from pydantic import BaseModel
from resources.inlined.types.a_nested_literal import ANestedLiteral
from dt import datetime
from core.datetime_utils import serialize_datetime


class ATopLevelLiteral(BaseModel):
    nested_literal: ANestedLiteral

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
