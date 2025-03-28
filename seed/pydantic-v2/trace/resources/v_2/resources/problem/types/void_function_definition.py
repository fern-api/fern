from typing import List

from core.datetime_utils import serialize_datetime
from dt import datetime
from resources.v_2.resources.problem.types.function_implementation_for_multiple_languages import (
    FunctionImplementationForMultipleLanguages,
)
from resources.v_2.resources.problem.types.parameter import Parameter

from pydantic import BaseModel


class VoidFunctionDefinition(BaseModel):
    parameters: List[Parameter]
    code: FunctionImplementationForMultipleLanguages

    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}
