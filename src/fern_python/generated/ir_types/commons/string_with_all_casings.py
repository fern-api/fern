from pydantic import BaseModel, Field


class StringWithAllCasings(BaseModel):
    original_value: str = Field(alias="originalValue")
    camel_case: str = Field(alias="camelCase")
    pascal_case: str = Field(alias="pascalCase")
    snake_case: str = Field(alias="snakeCase")
    screaming_snake_case: str = Field(alias="screamingSnakeCase")
