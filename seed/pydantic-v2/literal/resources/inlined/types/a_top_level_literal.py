from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.inlined.types.a_nested_literal import ANestedLiteral

from pydantic import BaseModel


class ATopLevelLiteral(BaseModel):
    nested_literal: ANestedLiteral

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
