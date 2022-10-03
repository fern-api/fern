import typing

import pydantic

from ..submission.trace_response import TraceResponse
from ..submission.workspace_run_details import WorkspaceRunDetails


class StoreTracedWorkspaceRequest(pydantic.BaseModel):
    workspace_run_details: WorkspaceRunDetails = pydantic.Field(alias="workspaceRunDetails")
    trace_responses: typing.List[TraceResponse] = pydantic.Field(alias="traceResponses")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
