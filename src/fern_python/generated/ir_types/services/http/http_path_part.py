import typing

import pydantic


class HttpPathPart(pydantic.BaseModel):
    path_parameter: str = pydantic.Field(alias="pathParameter")
    tail: str

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
