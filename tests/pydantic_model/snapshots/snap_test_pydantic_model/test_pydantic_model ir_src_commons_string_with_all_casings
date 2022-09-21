import pydantic


class StringWithAllCasings(pydantic.BaseModel):
    original_value: str = pydantic.Field(alias="originalValue")
    camel_case: str = pydantic.Field(alias="camelCase")
    pascal_case: str = pydantic.Field(alias="pascalCase")
    snake_case: str = pydantic.Field(alias="snakeCase")
    screaming_snake_case: str = pydantic.Field(alias="screamingSnakeCase")

    class Config:
        allow_population_by_field_name = True
