import pydantic

from .submission_id import SubmissionId


class StdoutResponse(pydantic.BaseModel):
    submission_id: SubmissionId = pydantic.Field(alias="submissionId")
    stdout: str

    class Config:
        allow_population_by_field_name = True
