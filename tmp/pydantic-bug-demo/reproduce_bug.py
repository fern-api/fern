"""
Reproduces the FastAPI discriminated union bug.

The issue: When a child class inherits from a parent with extra="forbid",
the parent's validation rejects fields that only the child knows about.

Run with: python reproduce_bug.py
Requires: pip install pydantic
"""

import pydantic
from typing import List, Literal, Union
from typing_extensions import Annotated

print(f"Pydantic version: {pydantic.VERSION}")
print("=" * 60)

# =============================================================================
# PART 1: The Base Type (like OrEnvironmentFilter)
# =============================================================================

class OrEnvironmentFilter(pydantic.BaseModel):
    """
    This is the base type. It only knows about 'filters'.
    It has extra="forbid" which means it rejects unknown fields.
    """
    filters: List[str]

    model_config = pydantic.ConfigDict(extra="forbid")


# =============================================================================
# PART 2: The Internal Union Member (like _EnvironmentSearchFilter.Or)
# =============================================================================

class _EnvironmentSearchFilter:
    """
    Internal union members that inherit from base types and add discriminator.
    """

    class Or(OrEnvironmentFilter):  # <-- INHERITS from OrEnvironmentFilter
        """
        This adds the 'type' discriminator field.
        But the parent (OrEnvironmentFilter) doesn't know about 'type'!
        """
        type: Literal["or"] = "or"

    class And(pydantic.BaseModel):
        type: Literal["and"] = "and"
        filters: List[str]

        model_config = pydantic.ConfigDict(extra="forbid")


# =============================================================================
# PART 3: The Union Wrapper (like EnvironmentSearchFilter)
# =============================================================================

class EnvironmentSearchFilter(pydantic.BaseModel):
    """
    The discriminated union that routes based on 'type' field.
    """
    root: Annotated[
        Union[_EnvironmentSearchFilter.Or, _EnvironmentSearchFilter.And],
        pydantic.Field(discriminator="type")
    ]


# =============================================================================
# PART 4: Test the bug
# =============================================================================

print("\n" + "=" * 60)
print("TEST 1: Parse JSON with 'type' field (what Java SDK sends)")
print("=" * 60)

# This is what the Java SDK sends
java_sdk_json = {"type": "or", "filters": []}
print(f"\nInput JSON: {java_sdk_json}")

try:
    # Try to parse it as the internal union member directly
    result = _EnvironmentSearchFilter.Or(**java_sdk_json)
    print(f"SUCCESS: Parsed as _EnvironmentSearchFilter.Or")
    print(f"Result: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


print("\n" + "=" * 60)
print("TEST 2: Parse via the union wrapper (how FastAPI does it)")
print("=" * 60)

try:
    # This is how FastAPI would parse incoming JSON
    result = EnvironmentSearchFilter(root=java_sdk_json)
    print(f"SUCCESS: Parsed via EnvironmentSearchFilter")
    print(f"Result: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


print("\n" + "=" * 60)
print("TEST 3: Parse the base type directly (should work)")
print("=" * 60)

# This should work - no 'type' field
base_json = {"filters": ["a", "b"]}
print(f"\nInput JSON: {base_json}")

try:
    result = OrEnvironmentFilter(**base_json)
    print(f"SUCCESS: Parsed as OrEnvironmentFilter")
    print(f"Result: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


print("\n" + "=" * 60)
print("TEST 4: What fields does each class know about?")
print("=" * 60)

print(f"\nOrEnvironmentFilter fields: {list(OrEnvironmentFilter.model_fields.keys())}")
print(f"_EnvironmentSearchFilter.Or fields: {list(_EnvironmentSearchFilter.Or.model_fields.keys())}")
print(f"_EnvironmentSearchFilter.Or parent: {_EnvironmentSearchFilter.Or.__bases__}")


print("\n" + "=" * 60)
print("THE FIX: Don't use inheritance, copy fields instead")
print("=" * 60)

class _EnvironmentSearchFilterFixed:
    """
    Fixed version: No inheritance, fields are copied.
    """

    class Or(pydantic.BaseModel):  # <-- NO inheritance
        type: Literal["or"] = "or"
        filters: List[str]  # <-- Copied from OrEnvironmentFilter

        model_config = pydantic.ConfigDict(extra="forbid")


print(f"\nInput JSON: {java_sdk_json}")

try:
    result = _EnvironmentSearchFilterFixed.Or(**java_sdk_json)
    print(f"SUCCESS: Parsed as _EnvironmentSearchFilterFixed.Or")
    print(f"Result: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")
