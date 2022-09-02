import pydantic


class HttpErrorConfiguration(pydantic.BaseModel):
    status_code: int = pydantic.Field(alias="statusCode")
