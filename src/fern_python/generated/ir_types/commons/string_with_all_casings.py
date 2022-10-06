import typing

import pydantic


class StringWithAllCasings(pydantic.BaseModel):
    original_value: str = pydantic.Field(alias="originalValue")
    camel_case: str = pydantic.Field(alias="camelCase")
    pascal_case: str = pydantic.Field(alias="pascalCase")
    snake_case: str = pydantic.Field(alias="snakeCase")
    screaming_snake_case: str = pydantic.Field(alias="screamingSnakeCase")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    class Config:
        frozen = True
        allow_population_by_field_name = True
