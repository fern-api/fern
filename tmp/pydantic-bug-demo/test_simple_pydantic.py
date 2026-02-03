"""
Simple test without FastAPI TestClient - pure Pydantic validation.
"""

from __future__ import annotations

import typing

import pydantic
import typing_extensions

print(f"Pydantic version: {pydantic.VERSION}")
IS_PYDANTIC_V2 = pydantic.VERSION.startswith("2.")
print(f"IS_PYDANTIC_V2: {IS_PYDANTIC_V2}")

# =============================================================================
# Simulate Fern's pydantic_utilities.py
# =============================================================================

class UniversalBaseModel(pydantic.BaseModel):
    class Config:
        populate_by_name = True
        smart_union = True
        allow_population_by_field_name = True
        protected_namespaces = ()


if IS_PYDANTIC_V2:
    class V2RootModel(UniversalBaseModel, pydantic.RootModel):
        pass
    UniversalRootModel = V2RootModel
else:
    UniversalRootModel = UniversalBaseModel


def update_forward_refs(model: typing.Type, **localns: typing.Any) -> None:
    if IS_PYDANTIC_V2:
        model.model_rebuild(raise_errors=False)
    else:
        model.update_forward_refs(**localns)


# =============================================================================
# Customer's pattern
# =============================================================================

class OrEnvironmentFilter(UniversalBaseModel):
    filters: typing.List["EnvironmentSearchFilter"]

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid


class AndEnvironmentFilter(UniversalBaseModel):
    filters: typing.List["EnvironmentSearchFilter"]

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid


class EnvironmentSearchFilter(UniversalRootModel):
    if IS_PYDANTIC_V2:
        root: typing_extensions.Annotated[
            typing.Union[
                "_EnvironmentSearchFilter.And",
                "_EnvironmentSearchFilter.Or",
            ],
            pydantic.Field(discriminator="type"),
        ]
    else:
        __root__: typing_extensions.Annotated[
            typing.Union[
                "_EnvironmentSearchFilter.And",
                "_EnvironmentSearchFilter.Or",
            ],
            pydantic.Field(discriminator="type"),
        ]


class _EnvironmentSearchFilter:
    class And(AndEnvironmentFilter):
        type: typing.Literal["and"] = "and"

    class Or(OrEnvironmentFilter):
        type: typing.Literal["or"] = "or"


# Update forward refs
update_forward_refs(_EnvironmentSearchFilter.And)
update_forward_refs(_EnvironmentSearchFilter.Or)
update_forward_refs(EnvironmentSearchFilter)
update_forward_refs(OrEnvironmentFilter)
update_forward_refs(AndEnvironmentFilter)


# =============================================================================
# TESTS - Pure Pydantic validation
# =============================================================================

print("\n" + "=" * 60)
print("TEST 1: Direct parse of _EnvironmentSearchFilter.Or")
print("=" * 60)

json_data = {"type": "or", "filters": []}
print(f"JSON: {json_data}")

try:
    result = _EnvironmentSearchFilter.Or(**json_data)
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


print("\n" + "=" * 60)
print("TEST 2: Parse via EnvironmentSearchFilter.model_validate")
print("=" * 60)

try:
    result = EnvironmentSearchFilter.model_validate(json_data)
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


print("\n" + "=" * 60)
print("TEST 3: Nested filter parsing")
print("=" * 60)

nested_data = {
    "type": "and",
    "filters": [
        {"type": "or", "filters": []},
        {"type": "or", "filters": []}
    ]
}
print(f"JSON: {nested_data}")

try:
    result = EnvironmentSearchFilter.model_validate(nested_data)
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


print("\n" + "=" * 60)
print("TEST 4: Check model fields and config")
print("=" * 60)

print(f"OrEnvironmentFilter.model_fields: {list(OrEnvironmentFilter.model_fields.keys())}")
print(f"_EnvironmentSearchFilter.Or.model_fields: {list(_EnvironmentSearchFilter.Or.model_fields.keys())}")

if IS_PYDANTIC_V2:
    print(f"OrEnvironmentFilter.model_config: {OrEnvironmentFilter.model_config}")
    print(f"_EnvironmentSearchFilter.Or.model_config: {_EnvironmentSearchFilter.Or.model_config}")
