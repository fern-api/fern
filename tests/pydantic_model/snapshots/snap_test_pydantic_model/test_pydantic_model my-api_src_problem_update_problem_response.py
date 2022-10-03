import pydantic


class UpdateProblemResponse(pydantic.BaseModel):
    problem_version: int = pydantic.Field(alias="problemVersion")

    class Config:
        allow_population_by_field_name = True
