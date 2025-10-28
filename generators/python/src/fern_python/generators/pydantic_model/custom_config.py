from typing import Literal, Optional

import pydantic
from ...external_dependencies.pydantic import PydanticVersionCompatibility
from typing_extensions import Self

UnionNamingVersions = Literal["v0", "v1"]

EnumTypes = Literal["literals", "forward_compatible_python_enums", "python_enums"]


class BasePydanticModelCustomConfig(pydantic.BaseModel):
    version: PydanticVersionCompatibility = PydanticVersionCompatibility.Both
    frozen: bool = False
    orm_mode: bool = False
    smart_union: bool = False
    require_optional_fields: bool = False
    use_str_enums: bool = True
    """
    use_str_enums is deprecated, prefer `enum_type` instead (default: 'literals', which is the equivalent of `use_str_enums=True`)
    """

    enum_type: EnumTypes = "literals"
    """
    The type of enums to use in the generated models. Options are:
    - 'literals': Use Python Literal types, e.g. `MyEnum = Literal["foo", "bar"]`
    - 'forward_compatible_python_enums': Use Python Enum classes, with an `MyEnum._UNKNOWN member for forward compatibility, `MyEnum._UNKNOWN.value` contains the raw unrecognized value.
    - 'python_enums': Your vanilla Python enum class, with the members defined within your API.
    """

    wrapped_aliases: bool = False

    union_naming: UnionNamingVersions = "v0"
    """
    If you are dealing with discriminated union members that already have the discriminant property on them (and they're only used in one union)
    you should prefer the global API config within your generators.yml:
    ```yaml
    - name: fernapi/fern-python-sdk
      version: 3.0.0-rc0
      api:
        settings:
          unions: v1
    ```
    """

    use_inheritance_for_extended_models: bool = True
    """
    Whether to generate Pydantic models that implement inheritance when a model utilizes the Fern `extends` keyword.
    """

    use_pydantic_field_aliases: bool = True

    # The recursion limit to set for the SDK. Must be greater than 1000 (the default recursion limit in Python).
    # If set, the root __init__.py will include sys.setrecursionlimit() to ensure
    # the recursion limit is at least this value.
    recursion_limit: Optional[int] = pydantic.Field(None, gt=1000)

    @pydantic.model_validator(mode="after")
    def check_wrapped_aliases_v1_or_v2_only(self) -> Self:
        version_compat = self.version
        use_wrapped_aliases = self.wrapped_aliases

        if use_wrapped_aliases and version_compat not in [
            PydanticVersionCompatibility.V1,
            PydanticVersionCompatibility.V1_ON_V2,
            PydanticVersionCompatibility.V2,
        ]:
            raise ValueError(
                "Wrapped aliases are only supported in Pydantic V1, V1_ON_V2, or V2, please update your `version` field appropriately to continue using wrapped aliases."
            )

        if self.enum_type != "literals":
            self.use_str_enums = False
        else:
            self.use_str_enums = True

        return self


class PydanticModelCustomConfig(BasePydanticModelCustomConfig):
    include_validators: bool = False
    # DEPRECATED: use `extra_fields` instead
    forbid_extra_fields: bool = False
    extra_fields: Optional[Literal["allow", "forbid", "ignore"]] = "allow"
    skip_formatting: bool = False
    include_union_utils: bool = False
    package_name: Optional[str] = None
    # Skip validation of fields (automatically includes additional fields)
    skip_validation: bool = False
    # Leverage defaults specified in the API specification
    use_provided_defaults: bool = False

    # Whether or not to generate TypedDicts instead of Pydantic
    # Models for request objects.
    use_typeddict_requests: bool = False

    class Config:
        extra = pydantic.Extra.forbid
