"""
Test with 7 variants like customer has.
Maybe the issue is with many variants in the union?
"""

from __future__ import annotations

import typing

import pydantic
import typing_extensions

print(f"Pydantic version: {pydantic.VERSION}")
IS_PYDANTIC_V2 = pydantic.VERSION.startswith("2.")

# =============================================================================
# Base utilities
# =============================================================================

class UniversalBaseModel(pydantic.BaseModel):
    class Config:
        populate_by_name = True
        protected_namespaces = ()

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults = {"by_alias": True, "exclude_unset": True, **kwargs}
        if IS_PYDANTIC_V2:
            return super().model_dump(**kwargs_with_defaults)
        return super().dict(**kwargs_with_defaults)


if IS_PYDANTIC_V2:
    class V2RootModel(UniversalBaseModel, pydantic.RootModel):
        pass
    UniversalRootModel = V2RootModel
else:
    UniversalRootModel = UniversalBaseModel


def update_forward_refs(model, **localns):
    if IS_PYDANTIC_V2:
        model.model_rebuild(raise_errors=False)
    else:
        model.update_forward_refs(**localns)


# =============================================================================
# All the filter types (matching customer's structure)
# =============================================================================

class AndEnvironmentFilter(UniversalBaseModel):
    filters: typing.List["EnvironmentSearchFilter"]
    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid


class OrEnvironmentFilter(UniversalBaseModel):
    filters: typing.List["EnvironmentSearchFilter"]
    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid


class NotEnvironmentFilter(UniversalBaseModel):
    filter: "EnvironmentSearchFilter"
    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid


class EnvironmentIdFilter(UniversalBaseModel):
    id: str
    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid


class EnvironmentTitleLikeFilter(UniversalBaseModel):
    title: str
    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid


class EnvironmentTagIdFilter(UniversalBaseModel):
    tag_id: str
    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid


class EnvironmentOntologyStorageFilter(UniversalBaseModel):
    storage_type: str
    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid


# =============================================================================
# The union (with all 7 variants)
# =============================================================================

class EnvironmentSearchFilter(UniversalRootModel):
    if IS_PYDANTIC_V2:
        root: typing_extensions.Annotated[
            typing.Union[
                "_EnvironmentSearchFilter.And",
                "_EnvironmentSearchFilter.Or",
                "_EnvironmentSearchFilter.Not",
                "_EnvironmentSearchFilter.Id",
                "_EnvironmentSearchFilter.Title",
                "_EnvironmentSearchFilter.Tag",
                "_EnvironmentSearchFilter.OntologyStorageType",
            ],
            pydantic.Field(discriminator="type"),
        ]
    else:
        __root__: typing_extensions.Annotated[
            typing.Union[
                "_EnvironmentSearchFilter.And",
                "_EnvironmentSearchFilter.Or",
                "_EnvironmentSearchFilter.Not",
                "_EnvironmentSearchFilter.Id",
                "_EnvironmentSearchFilter.Title",
                "_EnvironmentSearchFilter.Tag",
                "_EnvironmentSearchFilter.OntologyStorageType",
            ],
            pydantic.Field(discriminator="type"),
        ]


class _EnvironmentSearchFilter:
    class And(AndEnvironmentFilter):
        type: typing.Literal["and"] = "and"

    class Or(OrEnvironmentFilter):
        type: typing.Literal["or"] = "or"

    class Not(NotEnvironmentFilter):
        type: typing.Literal["not"] = "not"

    class Id(EnvironmentIdFilter):
        type: typing.Literal["id"] = "id"

    class Title(EnvironmentTitleLikeFilter):
        type: typing.Literal["title"] = "title"

    class Tag(EnvironmentTagIdFilter):
        type: typing.Literal["tag"] = "tag"

    class OntologyStorageType(EnvironmentOntologyStorageFilter):
        type: typing.Literal["ontologyStorageType"] = "ontologyStorageType"


# Update forward refs
update_forward_refs(_EnvironmentSearchFilter.And)
update_forward_refs(_EnvironmentSearchFilter.Or)
update_forward_refs(_EnvironmentSearchFilter.Not)
update_forward_refs(_EnvironmentSearchFilter.Id)
update_forward_refs(_EnvironmentSearchFilter.Title)
update_forward_refs(_EnvironmentSearchFilter.Tag)
update_forward_refs(_EnvironmentSearchFilter.OntologyStorageType)
update_forward_refs(EnvironmentSearchFilter)
update_forward_refs(AndEnvironmentFilter)
update_forward_refs(OrEnvironmentFilter)
update_forward_refs(NotEnvironmentFilter)


# =============================================================================
# Tests
# =============================================================================

from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

class SearchRequest(UniversalBaseModel):
    filter: EnvironmentSearchFilter
    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid

update_forward_refs(SearchRequest)

@app.post("/search")
def search(request: SearchRequest):
    return {"status": "ok", "type": request.filter.root.type}

client = TestClient(app, raise_server_exceptions=False)

print("\n" + "=" * 60)
print("TEST 1: 'or' variant")
print("=" * 60)

body = {"filter": {"type": "or", "filters": []}}
response = client.post("/search", json=body)
print(f"Status: {response.status_code}, Response: {response.json()}")

print("\n" + "=" * 60)
print("TEST 2: 'and' variant")
print("=" * 60)

body = {"filter": {"type": "and", "filters": []}}
response = client.post("/search", json=body)
print(f"Status: {response.status_code}, Response: {response.json()}")

print("\n" + "=" * 60)
print("TEST 3: 'id' variant")
print("=" * 60)

body = {"filter": {"type": "id", "id": "env-123"}}
response = client.post("/search", json=body)
print(f"Status: {response.status_code}, Response: {response.json()}")

print("\n" + "=" * 60)
print("TEST 4: 'title' variant")
print("=" * 60)

body = {"filter": {"type": "title", "title": "Production"}}
response = client.post("/search", json=body)
print(f"Status: {response.status_code}, Response: {response.json()}")

print("\n" + "=" * 60)
print("TEST 5: 'ontologyStorageType' variant (camelCase)")
print("=" * 60)

body = {"filter": {"type": "ontologyStorageType", "storage_type": "s3"}}
response = client.post("/search", json=body)
print(f"Status: {response.status_code}, Response: {response.json()}")

print("\n" + "=" * 60)
print("TEST 6: Nested filters (or containing and)")
print("=" * 60)

body = {
    "filter": {
        "type": "or",
        "filters": [
            {"type": "and", "filters": []},
            {"type": "id", "id": "env-456"}
        ]
    }
}
response = client.post("/search", json=body)
print(f"Status: {response.status_code}, Response: {response.json()}")

print("\n" + "=" * 60)
print("TEST 7: 'not' variant with nested filter")
print("=" * 60)

body = {
    "filter": {
        "type": "not",
        "filter": {"type": "id", "id": "env-789"}
    }
}
response = client.post("/search", json=body)
print(f"Status: {response.status_code}, Response: {response.json()}")

# Check for any 422s
print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)
print("All tests completed. Check above for any 422 errors.")
