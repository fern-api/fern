import typing

import pydantic
import typing_extensions

from ..submission.trace_response import TraceResponse
from ..submission.workspace_run_details import WorkspaceRunDetails


class StoreTracedWorkspaceRequest(pydantic.BaseModel):
    workspace_run_details: WorkspaceRunDetails = pydantic.Field(alias="workspaceRunDetails")
    trace_responses: typing.List[TraceResponse] = pydantic.Field(alias="traceResponses")

    @pydantic.validator("workspace_run_details")
    def _validate_workspace_run_details(cls, workspace_run_details: WorkspaceRunDetails) -> WorkspaceRunDetails:
        for validator in StoreTracedWorkspaceRequest.Validators._workspace_run_details:
            workspace_run_details = validator(workspace_run_details)
        return workspace_run_details

    @pydantic.validator("trace_responses")
    def _validate_trace_responses(cls, trace_responses: typing.List[TraceResponse]) -> typing.List[TraceResponse]:
        for validator in StoreTracedWorkspaceRequest.Validators._trace_responses:
            trace_responses = validator(trace_responses)
        return trace_responses

    class Validators:
        _workspace_run_details: typing.ClassVar[
            typing.List[typing.Callable[[WorkspaceRunDetails], WorkspaceRunDetails]]
        ] = []
        _trace_responses: typing.ClassVar[
            typing.List[typing.Callable[[typing.List[TraceResponse]], typing.List[TraceResponse]]]
        ] = []

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["workspace_run_details"]
        ) -> typing.Callable[
            [typing.Callable[[WorkspaceRunDetails], WorkspaceRunDetails]],
            typing.Callable[[WorkspaceRunDetails], WorkspaceRunDetails],
        ]:
            ...

        @typing.overload
        @classmethod
        def field(
            cls, field_name: typing_extensions.Literal["trace_responses"]
        ) -> typing.Callable[
            [typing.Callable[[typing.List[TraceResponse]], typing.List[TraceResponse]]],
            typing.Callable[[typing.List[TraceResponse]], typing.List[TraceResponse]],
        ]:
            ...

        @classmethod
        def field(cls, field_name: str) -> typing.Any:
            def decorator(validator: typing.Any) -> typing.Any:
                if field_name == "workspace_run_details":
                    cls._workspace_run_details.append(validator)
                elif field_name == "trace_responses":
                    cls._trace_responses.append(validator)
                else:
                    raise RuntimeError("Field does not exist on StoreTracedWorkspaceRequest: " + field_name)

                return validator

            return decorator

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
