import pydantic

from ..commons.problem_id import ProblemId
from .submission_id import SubmissionId


class CustomTestCasesUnsupported(pydantic.BaseModel):
    problem_id: ProblemId = pydantic.Field(alias="problemId")
    submission_id: SubmissionId = pydantic.Field(alias="submissionId")

    class Config:
        allow_population_by_field_name = True
