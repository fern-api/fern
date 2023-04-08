import pydantic


class PydanticConfig(pydantic.BaseModel):
    frozen: bool = False
    orm_mode: bool = False


class FastAPICustomConfig(pydantic.BaseModel):
    include_validators: bool = False
    skip_formatting: bool = False
    pydantic_config: PydanticConfig = PydanticConfig()
