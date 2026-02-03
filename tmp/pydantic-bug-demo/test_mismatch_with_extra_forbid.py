"""
Test mismatch with extra="forbid" on RootModel
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
# Pydantic utilities - WITH extra="forbid" on UniversalRootModel
# =============================================================================

class UniversalBaseModel(pydantic.BaseModel):
    model_config = pydantic.ConfigDict(
        populate_by_name=True,
        protected_namespaces=(),
        extra="forbid"  # ADD THIS
    )


class UniversalRootModel(UniversalBaseModel, pydantic.RootModel):
    pass


def update_forward_refs(model: typing.Type, **localns: typing.Any) -> None:
    model.model_rebuild(raise_errors=False)


# =============================================================================
# EnvironmentSearchFilter (union type)
# =============================================================================

class OrEnvironmentFilter(UniversalBaseModel):
    filters: typing.List["EnvironmentSearchFilter"]


class AndEnvironmentFilter(UniversalBaseModel):
    filters: typing.List["EnvironmentSearchFilter"]


class _EnvironmentSearchFilter:
    class Or(OrEnvironmentFilter):
        type: typing.Literal["or"] = "or"

    class And(AndEnvironmentFilter):
        type: typing.Literal["and"] = "and"


class EnvironmentSearchFilter(UniversalRootModel):
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
# FastAPI endpoint - expects union directly
# =============================================================================

app = FastAPI()


@app.post("/search")
def search(body: EnvironmentSearchFilter = Body(...)) -> dict:
    return {"status": "ok"}


client = TestClient(app, raise_server_exceptions=False)


# =============================================================================
# TEST: SDK sends wrapped, server expects direct
# =============================================================================

print("\n" + "=" * 60)
print("TEST: SDK sends {'filter': {...}}, server expects {...} directly")
print("=" * 60)

java_sdk_payload = {"filter": {"type": "or", "filters": []}}
print(f"Request: {java_sdk_payload}")

response = client.post("/search", json=java_sdk_payload)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

if response.status_code == 422:
    print("\nError details:")
    for err in response.json().get("detail", []):
        print(f"  loc: {err.get('loc')}")
        print(f"  type: {err.get('type')}")
        print(f"  msg: {err.get('msg')}")
        print(f"  input: {err.get('input')}")
