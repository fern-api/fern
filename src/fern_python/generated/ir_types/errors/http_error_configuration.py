import typing

import pydantic


class HttpErrorConfiguration(pydantic.BaseModel):
    status_code: int = pydantic.Field(alias="statusCode")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
