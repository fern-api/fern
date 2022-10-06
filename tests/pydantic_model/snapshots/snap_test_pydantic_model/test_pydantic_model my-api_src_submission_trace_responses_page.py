import typing

import pydantic

from .trace_response import TraceResponse


class TraceResponsesPage(pydantic.BaseModel):
    offset: typing.Optional[int]
    trace_responses: typing.List[TraceResponse] = pydantic.Field(alias="traceResponses")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
