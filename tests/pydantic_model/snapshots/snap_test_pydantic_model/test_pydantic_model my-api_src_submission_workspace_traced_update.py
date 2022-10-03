import typing

import pydantic


class WorkspaceTracedUpdate(pydantic.BaseModel):
    trace_responses_size: int = pydantic.Field(alias="traceResponsesSize")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
