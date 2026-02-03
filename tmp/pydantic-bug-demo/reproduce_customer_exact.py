"""
Reproduce EXACTLY what the customer's generated code looks like.

From the customer's files:
- or_environment_filter.py
- environment_search_filter.py

The key difference might be in how the factory method works.
"""

import pydantic
from typing import List, Literal, Union, ClassVar, Any, Dict, TypeVar
from typing_extensions import Annotated

print(f"Pydantic version: {pydantic.VERSION}")
IS_PYDANTIC_V2 = pydantic.VERSION.startswith("2.")
print(f"IS_PYDANTIC_V2: {IS_PYDANTIC_V2}")
print("=" * 60)


# =============================================================================
# UniversalBaseModel and UniversalRootModel (from Fern core utilities)
# =============================================================================

if IS_PYDANTIC_V2:
    class UniversalBaseModel(pydantic.BaseModel):
        pass

    class UniversalRootModel(pydantic.BaseModel):
        pass
else:
    class UniversalBaseModel(pydantic.BaseModel):
        pass

    class UniversalRootModel(pydantic.BaseModel):
        pass


# =============================================================================
# From: or_environment_filter.py (the base type)
# =============================================================================

class OrEnvironmentFilter(UniversalBaseModel):
    filters: List["EnvironmentSearchFilter"]

    if IS_PYDANTIC_V2:
        model_config: ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid


# =============================================================================
# From: environment_search_filter.py (the union)
# This is the EXACT pattern from the customer's file
# =============================================================================

T_Result = TypeVar("T_Result")


class _Factory:
    def or_(self, value: OrEnvironmentFilter) -> "EnvironmentSearchFilter":
        if IS_PYDANTIC_V2:
            # THIS IS THE KEY! It calls .dict() and spreads the values
            return EnvironmentSearchFilter(
                root=_EnvironmentSearchFilter.Or(**value.dict(exclude_unset=True), type="or")
            )
        else:
            return EnvironmentSearchFilter(
                __root__=_EnvironmentSearchFilter.Or(**value.dict(exclude_unset=True), type="or")
            )


class _EnvironmentSearchFilter:
    class Or(OrEnvironmentFilter):
        type: Literal["or"] = "or"


if IS_PYDANTIC_V2:
    class EnvironmentSearchFilter(UniversalRootModel):
        factory: ClassVar[_Factory] = _Factory()

        root: Annotated[
            Union[_EnvironmentSearchFilter.Or],
            pydantic.Field(discriminator="type")
        ]

        def get_as_union(self) -> _EnvironmentSearchFilter.Or:
            return self.root
else:
    class EnvironmentSearchFilter(UniversalRootModel):
        factory: ClassVar[_Factory] = _Factory()

        __root__: Annotated[
            Union[_EnvironmentSearchFilter.Or, _EnvironmentSearchFilter.Or],  # Need 2 for v1
            pydantic.Field(discriminator="type")
        ]

        def get_as_union(self) -> _EnvironmentSearchFilter.Or:
            return self.__root__


# Forward reference update
OrEnvironmentFilter.update_forward_refs()
_EnvironmentSearchFilter.Or.update_forward_refs() if hasattr(_EnvironmentSearchFilter.Or, 'update_forward_refs') else None


# =============================================================================
# TEST 1: What Java SDK sends over the wire
# =============================================================================

print("\n" + "=" * 60)
print("TEST 1: Raw JSON parsing (what FastAPI receives from Java SDK)")
print("=" * 60)

# This is EXACTLY what the Java SDK sends
raw_json = {"type": "or", "filters": []}
print(f"\nRaw JSON from Java SDK: {raw_json}")

print("\n--- Direct parse to _EnvironmentSearchFilter.Or ---")
try:
    result = _EnvironmentSearchFilter.Or(**raw_json)
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")

print("\n--- Parse via EnvironmentSearchFilter ---")
try:
    if IS_PYDANTIC_V2:
        result = EnvironmentSearchFilter(root=raw_json)
    else:
        result = EnvironmentSearchFilter(__root__=raw_json)
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# TEST 2: Using the factory (how you'd create from Python)
# =============================================================================

print("\n" + "=" * 60)
print("TEST 2: Using factory method (Python SDK style)")
print("=" * 60)

or_filter = OrEnvironmentFilter(filters=[])
print(f"\nCreated OrEnvironmentFilter: {or_filter}")

try:
    result = EnvironmentSearchFilter.factory.or_(or_filter)
    print(f"SUCCESS via factory: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# TEST 3: Simulating FastAPI request body parsing
# =============================================================================

print("\n" + "=" * 60)
print("TEST 3: Simulating FastAPI request parsing")
print("=" * 60)

# FastAPI uses parse_obj or model_validate for request bodies
raw_json = {"type": "or", "filters": []}
print(f"\nRequest body JSON: {raw_json}")

try:
    if IS_PYDANTIC_V2:
        # Pydantic V2 way
        result = EnvironmentSearchFilter.model_validate({"root": raw_json})
        print(f"SUCCESS (model_validate with root): {result}")
    else:
        # Pydantic V1 way
        result = EnvironmentSearchFilter.parse_obj(raw_json)
        print(f"SUCCESS (parse_obj): {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")

# Also try direct validation of the raw json as root
print("\n--- Direct validation ---")
try:
    if IS_PYDANTIC_V2:
        # This is how FastAPI might actually do it
        result = pydantic.TypeAdapter(EnvironmentSearchFilter).validate_python({"root": raw_json})
        print(f"SUCCESS (TypeAdapter): {result}")
except Exception as e:
    print(f"FAILED: {e}")
