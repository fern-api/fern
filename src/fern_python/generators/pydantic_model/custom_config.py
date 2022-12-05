import pydantic


class CustomConfig(pydantic.BaseModel):
    exclude_validators: bool = False
    forbid_extra_fields: bool = False
