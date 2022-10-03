import typing

import pydantic

from .trace_response_v2 import TraceResponseV2


class TraceResponsesPageV2(pydantic.BaseModel):
    offset: typing.Optional[int]
    trace_responses: typing.List[TraceResponseV2] = pydantic.Field(alias="traceResponses")

    class Config:
        allow_population_by_field_name = True
