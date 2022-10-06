import typing

import pydantic

from .workspace_submission_update_info import WorkspaceSubmissionUpdateInfo


class WorkspaceSubmissionUpdate(pydantic.BaseModel):
    update_time: str = pydantic.Field(alias="updateTime")
    update_info: WorkspaceSubmissionUpdateInfo = pydantic.Field(alias="updateInfo")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
