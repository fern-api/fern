import pydantic


class FastAPICustomConfig(pydantic.BaseModel):
    include_validators: bool = False
