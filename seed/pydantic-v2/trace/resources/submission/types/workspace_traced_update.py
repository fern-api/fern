from pydantic import BaseModel


class WorkspaceTracedUpdate(BaseModel):
    trace_responses_size: int = Field(alias="traceResponsesSize")
