import pydantic


class CustomConfig(pydantic.BaseModel):
    exclude_validators: bool = False
