"""
The customer's attached file shows using class Config style.
Maybe there's something about mixing Config styles?
"""

import pydantic
from typing import List, Literal, Union, ClassVar, Any, Dict
from typing_extensions import Annotated

print(f"Pydantic version: {pydantic.VERSION}")

from fastapi import FastAPI
from fastapi.testclient import TestClient

print("=" * 60)

# =============================================================================
# Using class Config (V1 style) which Fern generates for compatibility
# =============================================================================

class UniversalBaseModel(pydantic.BaseModel):
    """Fern's UniversalBaseModel uses class Config"""

    class Config:
        populate_by_name = True
        smart_union = True  # Deprecated in V2
        allow_population_by_field_name = True
        protected_namespaces = ()


class V2RootModel(UniversalBaseModel, pydantic.RootModel):
    pass


# =============================================================================
# Models using class Config (matching customer's files exactly)
# =============================================================================

class OrEnvironmentFilter(UniversalBaseModel):
    filters: List["EnvironmentSearchFilter"]

    class Config:
        extra = "forbid"


class _EnvironmentSearchFilter:
    class Or(OrEnvironmentFilter):
        type: Literal["or"] = "or"
        # Note: NO extra Config here - inherits from parent

    class And(UniversalBaseModel):
        type: Literal["and"] = "and"
        filters: List["EnvironmentSearchFilter"]

        class Config:
            extra = "forbid"


class EnvironmentSearchFilter(V2RootModel):
    root: Annotated[
        Union[_EnvironmentSearchFilter.Or, _EnvironmentSearchFilter.And],
        pydantic.Field(discriminator="type"),
    ]


# Rebuild
OrEnvironmentFilter.model_rebuild()
_EnvironmentSearchFilter.Or.model_rebuild()
_EnvironmentSearchFilter.And.model_rebuild()
EnvironmentSearchFilter.model_rebuild()


# =============================================================================
# Tests
# =============================================================================

print("\n" + "=" * 60)
print("TEST 1: Check config inheritance")
print("=" * 60)

print(f"UniversalBaseModel.model_config: {UniversalBaseModel.model_config}")
print(f"OrEnvironmentFilter.model_config: {OrEnvironmentFilter.model_config}")
print(f"_EnvironmentSearchFilter.Or.model_config: {_EnvironmentSearchFilter.Or.model_config}")


print("\n" + "=" * 60)
print("TEST 2: Direct parse")
print("=" * 60)

json_data = {"type": "or", "filters": []}
print(f"JSON: {json_data}")

try:
    result = _EnvironmentSearchFilter.Or(**json_data)
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


print("\n" + "=" * 60)
print("TEST 3: Via RootModel")
print("=" * 60)

try:
    result = EnvironmentSearchFilter.model_validate(json_data)
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


print("\n" + "=" * 60)
print("TEST 4: FastAPI endpoint")
print("=" * 60)

app = FastAPI()

class SearchRequest(UniversalBaseModel):
    filter: EnvironmentSearchFilter

    class Config:
        extra = "forbid"

SearchRequest.model_rebuild()

@app.post("/search")
def search(request: SearchRequest):
    return {"status": "ok"}

client = TestClient(app, raise_server_exceptions=False)

body = {"filter": {"type": "or", "filters": []}}
print(f"Request: {body}")

response = client.post("/search", json=body)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

if response.status_code == 422:
    print("\n*** BUG REPRODUCED! ***")
    for err in response.json().get("detail", []):
        print(f"  type: {err.get('type')}")
        print(f"  loc: {err.get('loc')}")
        print(f"  msg: {err.get('msg')}")
