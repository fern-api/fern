import pydantic


class HttpErrorConfiguration(pydantic.BaseModel):
    status_code: int = pydantic.Field(alias="statusCode")

    class Config:
        allow_population_by_field_name = True
