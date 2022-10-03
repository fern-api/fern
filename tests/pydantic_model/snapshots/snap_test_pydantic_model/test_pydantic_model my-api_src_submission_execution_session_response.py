import typing

import pydantic

from ..commons.language import Language
from .execution_session_status import ExecutionSessionStatus


class ExecutionSessionResponse(pydantic.BaseModel):
    session_id: str = pydantic.Field(alias="sessionId")
    execution_session_url: typing.Optional[str] = pydantic.Field(alias="executionSessionUrl")
    language: Language
    status: ExecutionSessionStatus

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
