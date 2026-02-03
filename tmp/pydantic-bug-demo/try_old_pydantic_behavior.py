"""
Maybe the issue is with how Pydantic 2 handled things in earlier versions.
Let me try to simulate old behavior or find edge cases.

The customer's error shows:
  "loc": ["body", "filter"]

This means the error is at the "filter" field level, not inside the union.
Maybe the issue is with how SearchRequest validates the EnvironmentSearchFilter?
"""

import pydantic
from typing import List, Literal, Union, ClassVar, Any, Dict
from typing_extensions import Annotated

print(f"Pydantic version: {pydantic.VERSION}")
print("=" * 60)


# =============================================================================
# Maybe the issue is with __get_pydantic_core_schema__?
# =============================================================================

print("\n" + "=" * 60)
print("SCENARIO: Check if there's schema generation issues")
print("=" * 60)

class Base(pydantic.BaseModel):
    filters: List[str]
    model_config = pydantic.ConfigDict(extra="forbid")

class _Union:
    class Or(Base):
        type: Literal["or"] = "or"

# Get the core schema
import pydantic_core

try:
    schema = pydantic.TypeAdapter(_Union.Or).core_schema
    print(f"Core schema type: {schema.get('type')}")
    print(f"Core schema keys: {list(schema.keys())}")
except Exception as e:
    print(f"Error getting schema: {e}")


# =============================================================================
# What if the field is Optional?
# =============================================================================

print("\n" + "=" * 60)
print("SCENARIO: Optional union field")
print("=" * 60)

from typing import Optional

class FilterWrapper(pydantic.RootModel):
    root: Annotated[
        Union[_Union.Or],
        pydantic.Field(discriminator="type")
    ]

class RequestWithOptional(pydantic.BaseModel):
    filter: Optional[FilterWrapper] = None
    model_config = pydantic.ConfigDict(extra="forbid")

try:
    result = RequestWithOptional.model_validate({"filter": {"type": "or", "filters": []}})
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# What if there's an alias involved?
# =============================================================================

print("\n" + "=" * 60)
print("SCENARIO: Field with alias")
print("=" * 60)

class FilterWrapperAliased(pydantic.RootModel):
    root: Annotated[
        Union[_Union.Or],
        pydantic.Field(discriminator="type")
    ]

class RequestWithAlias(pydantic.BaseModel):
    filter_field: FilterWrapperAliased = pydantic.Field(alias="filter")
    model_config = pydantic.ConfigDict(extra="forbid", populate_by_name=True)

try:
    result = RequestWithAlias.model_validate({"filter": {"type": "or", "filters": []}})
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# What if we're dealing with recursive types incorrectly?
# =============================================================================

print("\n" + "=" * 60)
print("SCENARIO: Recursive type (filter contains filters)")
print("=" * 60)

# This matches the customer's actual structure
class RecursiveOrFilter(pydantic.BaseModel):
    filters: List["RecursiveFilter"]
    model_config = pydantic.ConfigDict(extra="forbid")

class _RecursiveUnion:
    class Or(RecursiveOrFilter):
        type: Literal["or"] = "or"

    class And(pydantic.BaseModel):
        type: Literal["and"] = "and"
        filters: List["RecursiveFilter"]
        model_config = pydantic.ConfigDict(extra="forbid")

class RecursiveFilter(pydantic.RootModel):
    root: Annotated[
        Union[_RecursiveUnion.Or, _RecursiveUnion.And],
        pydantic.Field(discriminator="type")
    ]

# Rebuild all
RecursiveOrFilter.model_rebuild()
_RecursiveUnion.Or.model_rebuild()
_RecursiveUnion.And.model_rebuild()
RecursiveFilter.model_rebuild()

class RecursiveRequest(pydantic.BaseModel):
    filter: RecursiveFilter
    model_config = pydantic.ConfigDict(extra="forbid")

RecursiveRequest.model_rebuild()

# Test simple
print("\nTest 1: Simple nested")
try:
    result = RecursiveRequest.model_validate({"filter": {"type": "or", "filters": []}})
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")

# Test with actual nesting
print("\nTest 2: Deeply nested (or containing and containing or)")
try:
    result = RecursiveRequest.model_validate({
        "filter": {
            "type": "or",
            "filters": [
                {
                    "type": "and",
                    "filters": [
                        {"type": "or", "filters": []}
                    ]
                }
            ]
        }
    })
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# What if the model hasn't been rebuilt?
# =============================================================================

print("\n" + "=" * 60)
print("SCENARIO: What if model_rebuild wasn't called?")
print("=" * 60)

class NoRebuildBase(pydantic.BaseModel):
    filters: List["NoRebuildFilter"]
    model_config = pydantic.ConfigDict(extra="forbid")

class _NoRebuildUnion:
    class Or(NoRebuildBase):
        type: Literal["or"] = "or"

class NoRebuildFilter(pydantic.RootModel):
    root: Annotated[
        Union[_NoRebuildUnion.Or],
        pydantic.Field(discriminator="type")
    ]

# DON'T call model_rebuild - see if this causes issues

try:
    result = NoRebuildFilter.model_validate({"type": "or", "filters": []})
    print(f"SUCCESS (no rebuild): {result}")
except pydantic.ValidationError as e:
    print(f"FAILED (no rebuild): {e}")
except Exception as e:
    print(f"OTHER ERROR (no rebuild): {type(e).__name__}: {e}")
