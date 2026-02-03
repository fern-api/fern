"""
THEORY: The Java SDK is sending {"filter": {...}} but the FastAPI endpoint
expects just {...} directly.

This would produce:
  "loc": ["body", "filter"],
  "msg": "Extra inputs are not permitted"

Because the server expects Shape directly, but receives {"filter": Shape}
"""

from __future__ import annotations

import typing

import pydantic
import typing_extensions

print(f"Pydantic version: {pydantic.VERSION}")
IS_PYDANTIC_V2 = pydantic.VERSION.startswith("2.")

from fastapi import FastAPI, Body
from fastapi.testclient import TestClient

# =============================================================================
# Pydantic utilities
# =============================================================================

class UniversalBaseModel(pydantic.BaseModel):
    class Config:
        populate_by_name = True
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
# EnvironmentSearchFilter (union type)
# =============================================================================

class OrEnvironmentFilter(UniversalBaseModel):
    filters: typing.List["EnvironmentSearchFilter"]

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")


class AndEnvironmentFilter(UniversalBaseModel):
    filters: typing.List["EnvironmentSearchFilter"]

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")


class _EnvironmentSearchFilter:
    class Or(OrEnvironmentFilter):
        type: typing.Literal["or"] = "or"

    class And(AndEnvironmentFilter):
        type: typing.Literal["and"] = "and"


class EnvironmentSearchFilter(UniversalRootModel):
    if IS_PYDANTIC_V2:
        root: typing_extensions.Annotated[
            typing.Union[_EnvironmentSearchFilter.Or, _EnvironmentSearchFilter.And],
            pydantic.Field(discriminator="type")
        ]


update_forward_refs(_EnvironmentSearchFilter.Or)
update_forward_refs(_EnvironmentSearchFilter.And)
update_forward_refs(EnvironmentSearchFilter)
update_forward_refs(OrEnvironmentFilter)
update_forward_refs(AndEnvironmentFilter)


# =============================================================================
# FastAPI endpoints
# =============================================================================

app = FastAPI()


# SCENARIO A: Server expects body to be EnvironmentSearchFilter directly
# (This is how Fern generates it based on seed tests)
@app.post("/search-direct")
def search_direct(body: EnvironmentSearchFilter = Body(...)) -> dict:
    return {"status": "ok", "received": "direct union"}


# SCENARIO B: Server expects body to be wrapped in a request model
class SearchRequest(UniversalBaseModel):
    filter: EnvironmentSearchFilter
    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")

update_forward_refs(SearchRequest)

@app.post("/search-wrapped")
def search_wrapped(body: SearchRequest) -> dict:
    return {"status": "ok", "received": "wrapped"}


client = TestClient(app, raise_server_exceptions=False)


# =============================================================================
# TESTS - Simulate the mismatch
# =============================================================================

print("\n" + "=" * 60)
print("SCENARIO: Java SDK sends {'filter': {...}}")
print("=" * 60)

java_sdk_payload = {"filter": {"type": "or", "filters": []}}

print("\n--- To /search-direct (expects union directly) ---")
print(f"Request: {java_sdk_payload}")
response = client.post("/search-direct", json=java_sdk_payload)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

if response.status_code == 422:
    print("\n*** THIS IS THE BUG! ***")
    for err in response.json().get("detail", []):
        print(f"  loc: {err.get('loc')}")
        print(f"  type: {err.get('type')}")
        print(f"  msg: {err.get('msg')}")
        print(f"  input: {err.get('input')}")


print("\n--- To /search-wrapped (expects wrapper model) ---")
print(f"Request: {java_sdk_payload}")
response = client.post("/search-wrapped", json=java_sdk_payload)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")


print("\n" + "=" * 60)
print("CORRECT: Java SDK should send just the union directly")
print("=" * 60)

correct_payload = {"type": "or", "filters": []}

print("\n--- To /search-direct (expects union directly) ---")
print(f"Request: {correct_payload}")
response = client.post("/search-direct", json=correct_payload)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
