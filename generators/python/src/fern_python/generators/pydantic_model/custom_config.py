from typing import Literal, Optional

import pydantic

from ...external_dependencies.pydantic import PydanticVersionCompatibility


class BasePydanticModelCustomConfig(pydantic.BaseModel):
    version: PydanticVersionCompatibility = PydanticVersionCompatibility.Both
    frozen: bool = False
    orm_mode: bool = False
    smart_union: bool = False
    require_optional_fields: bool = False
    use_str_enums: bool = True


class PydanticModelCustomConfig(BasePydanticModelCustomConfig):
    include_validators: bool = False
    # DEPRECATED: use `extra_fields` instead
    forbid_extra_fields: bool = False
    extra_fields: Optional[Literal["allow", "forbid"]] = "allow"
    skip_formatting: bool = False
    include_union_utils: bool = False
    # Skip validation of fields (automatically includes additional fields)
    skip_validation: bool = False
    # Leverage defaults specified in the API specification
    use_provided_defaults: bool = False

    # Whether or not to generate TypedDicts instead of Pydantic
    # Models for request objects.
    use_typeddict_requests: bool = False
