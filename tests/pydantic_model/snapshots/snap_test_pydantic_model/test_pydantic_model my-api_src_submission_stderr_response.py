import pydantic

from .submission_id import SubmissionId


class StderrResponse(pydantic.BaseModel):
    submission_id: SubmissionId = pydantic.Field(alias="submissionId")
    stderr: str

    class Config:
        allow_population_by_field_name = True
