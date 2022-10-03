import typing

import pydantic

from ..commons.language import Language
from .submission_type_state import SubmissionTypeState


class GetSubmissionStateResponse(pydantic.BaseModel):
    time_submitted: typing.Optional[str] = pydantic.Field(alias="timeSubmitted")
    submission: str
    language: Language
    submission_type_state: SubmissionTypeState = pydantic.Field(alias="submissionTypeState")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        allow_population_by_field_name = True
