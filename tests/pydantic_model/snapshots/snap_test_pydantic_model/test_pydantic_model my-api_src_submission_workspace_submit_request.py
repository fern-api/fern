import typing

import pydantic

from ..commons.language import Language
from .submission_file_info import SubmissionFileInfo
from .submission_id import SubmissionId


class WorkspaceSubmitRequest(pydantic.BaseModel):
    submission_id: SubmissionId = pydantic.Field(alias="submissionId")
    language: Language
    submission_files: typing.List[SubmissionFileInfo] = pydantic.Field(alias="submissionFiles")
    user_id: typing.Optional[str] = pydantic.Field(alias="userId")

    class Config:
        allow_population_by_field_name = True
