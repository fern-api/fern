import typing

import pydantic

from ..commons.language import Language
from ..commons.problem_id import ProblemId
from .submission_file_info import SubmissionFileInfo
from .submission_id import SubmissionId


class SubmitRequestV2(pydantic.BaseModel):
    submission_id: SubmissionId = pydantic.Field(alias="submissionId")
    language: Language
    submission_files: typing.List[SubmissionFileInfo] = pydantic.Field(alias="submissionFiles")
    problem_id: ProblemId = pydantic.Field(alias="problemId")
    problem_version: typing.Optional[int] = pydantic.Field(alias="problemVersion")
    user_id: typing.Optional[str] = pydantic.Field(alias="userId")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
