import typing

import pydantic

from .execution_session_state import ExecutionSessionState


class GetExecutionSessionStateResponse(pydantic.BaseModel):
    states: typing.Dict[str, ExecutionSessionState]
    num_warming_instances: typing.Optional[int] = pydantic.Field(alias="numWarmingInstances")
    warming_session_ids: typing.List[str] = pydantic.Field(alias="warmingSessionIds")

    class Config:
        allow_population_by_field_name = True
