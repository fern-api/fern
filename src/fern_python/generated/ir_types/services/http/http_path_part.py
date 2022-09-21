import pydantic


class HttpPathPart(pydantic.BaseModel):
    path_parameter: str = pydantic.Field(alias="pathParameter")
    tail: str

    class Config:
        allow_population_by_field_name = True
