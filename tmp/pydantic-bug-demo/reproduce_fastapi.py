"""
Simulate EXACTLY how FastAPI parses request bodies.

FastAPI receives raw JSON and validates it against the Pydantic model.
The key is that FastAPI parses the ROOT of the JSON, not wrapped in {"root": ...}
"""

import pydantic
from typing import List, Literal, Union, ClassVar, TypeVar
from typing_extensions import Annotated

print(f"Pydantic version: {pydantic.VERSION}")
IS_PYDANTIC_V2 = pydantic.VERSION.startswith("2.")
print(f"IS_PYDANTIC_V2: {IS_PYDANTIC_V2}")
print("=" * 60)


# =============================================================================
# Fern's base utilities
# =============================================================================

class UniversalBaseModel(pydantic.BaseModel):
    pass


# For RootModel in v2, we need special handling
if IS_PYDANTIC_V2:
    class UniversalRootModel(pydantic.RootModel):
        pass
else:
    class UniversalRootModel(pydantic.BaseModel):
        pass


# =============================================================================
# Base type
# =============================================================================

class OrEnvironmentFilter(UniversalBaseModel):
    filters: List["EnvironmentSearchFilter"]

    model_config: ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")


# =============================================================================
# Union (matching Fern's pattern)
# =============================================================================

class _EnvironmentSearchFilter:
    class Or(OrEnvironmentFilter):
        type: Literal["or"] = "or"

    class And(UniversalBaseModel):
        type: Literal["and"] = "and"
        filters: List["EnvironmentSearchFilter"]
        model_config: ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")


if IS_PYDANTIC_V2:
    class EnvironmentSearchFilter(pydantic.RootModel):
        root: Annotated[
            Union[_EnvironmentSearchFilter.Or, _EnvironmentSearchFilter.And],
            pydantic.Field(discriminator="type")
        ]
else:
    class EnvironmentSearchFilter(pydantic.BaseModel):
        __root__: Annotated[
            Union[_EnvironmentSearchFilter.Or, _EnvironmentSearchFilter.And],
            pydantic.Field(discriminator="type")
        ]


# Update forward refs
if IS_PYDANTIC_V2:
    OrEnvironmentFilter.model_rebuild()
    _EnvironmentSearchFilter.Or.model_rebuild()
    _EnvironmentSearchFilter.And.model_rebuild()
    EnvironmentSearchFilter.model_rebuild()
else:
    OrEnvironmentFilter.update_forward_refs()
    _EnvironmentSearchFilter.Or.update_forward_refs()
    _EnvironmentSearchFilter.And.update_forward_refs()
    EnvironmentSearchFilter.update_forward_refs()


# =============================================================================
# TEST: How FastAPI parses request bodies
# =============================================================================

print("\n" + "=" * 60)
print("TEST: FastAPI request body parsing")
print("=" * 60)

# This is the raw JSON that Java SDK sends
raw_json = {"type": "or", "filters": []}
print(f"\nRaw JSON body from Java SDK: {raw_json}")

# FastAPI uses model_validate (v2) or parse_obj (v1) DIRECTLY on the JSON
# For a RootModel, this should work

print("\n--- How FastAPI validates (direct JSON, no wrapper) ---")
try:
    if IS_PYDANTIC_V2:
        # For RootModel, model_validate should accept the raw value directly
        result = EnvironmentSearchFilter.model_validate(raw_json)
        print(f"SUCCESS: {result}")
    else:
        result = EnvironmentSearchFilter.parse_obj(raw_json)
        print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# TEST: Nested scenario (filter inside a request)
# =============================================================================

print("\n" + "=" * 60)
print("TEST: Nested in a request body (like endpoint parameter)")
print("=" * 60)

class SearchRequest(pydantic.BaseModel):
    filter: EnvironmentSearchFilter

    model_config: ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")


# Rebuild for forward refs
if IS_PYDANTIC_V2:
    SearchRequest.model_rebuild()

# This is what the full request body looks like
request_json = {
    "filter": {"type": "or", "filters": []}
}
print(f"\nFull request body: {request_json}")

try:
    if IS_PYDANTIC_V2:
        result = SearchRequest.model_validate(request_json)
        print(f"SUCCESS: {result}")
    else:
        result = SearchRequest.parse_obj(request_json)
        print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED!")
    print(f"Error: {e}")
    for error in e.errors():
        print(f"  - type: {error['type']}")
        print(f"    loc: {error['loc']}")
        print(f"    msg: {error['msg']}")
        print(f"    input: {error.get('input')}")
