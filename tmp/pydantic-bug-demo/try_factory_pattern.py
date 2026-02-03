"""
Try the exact Fern factory pattern - maybe the issue is in how the factory
creates instances using .dict() and ** spreading.
"""

import pydantic
from typing import List, Literal, Union, ClassVar, Any, Dict, Optional
from typing_extensions import Annotated

print(f"Pydantic version: {pydantic.VERSION}")

from fastapi import FastAPI
from fastapi.testclient import TestClient

print("=" * 60)

IS_PYDANTIC_V2 = pydantic.VERSION.startswith("2.")

# =============================================================================
# Exact Fern pattern with Factory
# =============================================================================

class OrEnvironmentFilter(pydantic.BaseModel):
    filters: List["EnvironmentSearchFilter"]
    model_config = pydantic.ConfigDict(extra="forbid")


class _EnvironmentSearchFilter:
    class Or(OrEnvironmentFilter):
        type: Literal["or"] = "or"

    class And(pydantic.BaseModel):
        type: Literal["and"] = "and"
        filters: List["EnvironmentSearchFilter"]
        model_config = pydantic.ConfigDict(extra="forbid")


class _Factory:
    """Exact pattern from Fern's generated code"""

    def or_(self, value: OrEnvironmentFilter) -> "EnvironmentSearchFilter":
        # This is the EXACT pattern from environment_search_filter.py
        return EnvironmentSearchFilter(
            root=_EnvironmentSearchFilter.Or(**value.model_dump(exclude_unset=True), type="or")
        )

    def and_(self, value: "AndEnvironmentFilter") -> "EnvironmentSearchFilter":
        return EnvironmentSearchFilter(
            root=_EnvironmentSearchFilter.And(**value.model_dump(exclude_unset=True), type="and")
        )


class AndEnvironmentFilter(pydantic.BaseModel):
    filters: List["EnvironmentSearchFilter"]
    model_config = pydantic.ConfigDict(extra="forbid")


class EnvironmentSearchFilter(pydantic.RootModel):
    factory: ClassVar[_Factory] = _Factory()

    root: Annotated[
        Union[_EnvironmentSearchFilter.Or, _EnvironmentSearchFilter.And],
        pydantic.Field(discriminator="type"),
    ]

    def get_as_union(self):
        return self.root

    def dict(self, **kwargs: Any) -> Dict[str, Any]:
        return self.root.model_dump(**kwargs)


# Rebuild
OrEnvironmentFilter.model_rebuild()
AndEnvironmentFilter.model_rebuild()
_EnvironmentSearchFilter.Or.model_rebuild()
_EnvironmentSearchFilter.And.model_rebuild()
EnvironmentSearchFilter.model_rebuild()


# =============================================================================
# Tests
# =============================================================================

print("\n" + "=" * 60)
print("TEST 1: Create via factory (Python SDK style)")
print("=" * 60)

or_filter = OrEnvironmentFilter(filters=[])
print(f"Created OrEnvironmentFilter: {or_filter}")
print(f"  .model_dump(): {or_filter.model_dump()}")
print(f"  .model_dump(exclude_unset=True): {or_filter.model_dump(exclude_unset=True)}")

try:
    result = EnvironmentSearchFilter.factory.or_(or_filter)
    print(f"SUCCESS via factory: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


print("\n" + "=" * 60)
print("TEST 2: Create nested via factory")
print("=" * 60)

inner_or = OrEnvironmentFilter(filters=[])
outer_filter = EnvironmentSearchFilter.factory.or_(inner_or)

and_filter = AndEnvironmentFilter(filters=[outer_filter])
try:
    result = EnvironmentSearchFilter.factory.and_(and_filter)
    print(f"SUCCESS nested: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


print("\n" + "=" * 60)
print("TEST 3: Direct JSON parse (Java SDK style)")
print("=" * 60)

json_data = {"type": "or", "filters": []}
print(f"JSON: {json_data}")

try:
    result = EnvironmentSearchFilter.model_validate(json_data)
    print(f"SUCCESS direct parse: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


print("\n" + "=" * 60)
print("TEST 4: Nested JSON parse")
print("=" * 60)

nested_json = {
    "type": "and",
    "filters": [
        {"type": "or", "filters": []},
        {"type": "or", "filters": []}
    ]
}
print(f"JSON: {nested_json}")

try:
    result = EnvironmentSearchFilter.model_validate(nested_json)
    print(f"SUCCESS nested parse: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


print("\n" + "=" * 60)
print("TEST 5: FastAPI endpoint")
print("=" * 60)

app = FastAPI()

class SearchRequest(pydantic.BaseModel):
    filter: EnvironmentSearchFilter
    model_config = pydantic.ConfigDict(extra="forbid")

SearchRequest.model_rebuild()

@app.post("/search")
def search(request: SearchRequest):
    return {"status": "ok", "filter_type": request.filter.root.type}

client = TestClient(app, raise_server_exceptions=False)

body = {"filter": {"type": "or", "filters": []}}
print(f"Request: {body}")

response = client.post("/search", json=body)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

if response.status_code == 422:
    print("\n*** BUG REPRODUCED! ***")


print("\n" + "=" * 60)
print("TEST 6: What does serialization produce?")
print("=" * 60)

# Create via factory
or_filter = OrEnvironmentFilter(filters=[])
env_filter = EnvironmentSearchFilter.factory.or_(or_filter)

print(f"Created: {env_filter}")
print(f"  .model_dump(): {env_filter.model_dump()}")
print(f"  .model_dump_json(): {env_filter.model_dump_json()}")
print(f"  .dict(): {env_filter.dict()}")


print("\n" + "=" * 60)
print("TEST 7: Round-trip - serialize then parse")
print("=" * 60)

# Create via factory
or_filter = OrEnvironmentFilter(filters=[])
env_filter = EnvironmentSearchFilter.factory.or_(or_filter)

# Serialize
json_str = env_filter.model_dump_json()
print(f"Serialized: {json_str}")

# Parse back
try:
    parsed = EnvironmentSearchFilter.model_validate_json(json_str)
    print(f"Parsed back: {parsed}")
    print("SUCCESS: Round-trip works!")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")
