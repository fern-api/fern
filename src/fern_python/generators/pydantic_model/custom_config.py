import pydantic


class PydanticModelCustomConfig(pydantic.BaseModel):
    include_validators: bool = False
    forbid_extra_fields: bool = False
    wrapped_aliases: bool = False
    skip_formatting: bool = False
    include_union_utils: bool = False
    frozen: bool = False
    orm_mode: bool = False
