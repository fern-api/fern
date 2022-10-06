import typing

import pydantic

from .submission_id import SubmissionId


class SubmissionIdNotFound(pydantic.BaseModel):
    missing_submission_id: SubmissionId = pydantic.Field(alias="missingSubmissionId")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
