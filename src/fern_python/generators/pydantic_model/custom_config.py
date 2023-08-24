import pydantic


class BasePydanticModelCustomConfig(pydantic.BaseModel):
    frozen: bool = False
    orm_mode: bool = False
    smart_union: bool = False
    require_optional_fields: bool = True


class PydanticModelCustomConfig(BasePydanticModelCustomConfig):
    include_validators: bool = False
    forbid_extra_fields: bool = False
    wrapped_aliases: bool = False
    skip_formatting: bool = False
    include_union_utils: bool = False
