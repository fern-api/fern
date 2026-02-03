"""
Test script that works with different FastAPI/Pydantic versions.
"""

import pydantic
from typing import List, Literal, Union, ClassVar, Any, Dict
from typing_extensions import Annotated

print(f"Pydantic version: {pydantic.VERSION}")

try:
    import fastapi
    print(f"FastAPI version: {fastapi.__version__}")
except:
    print("FastAPI not installed")
    exit(1)

from fastapi import FastAPI
from fastapi.testclient import TestClient

IS_PYDANTIC_V2 = pydantic.VERSION.startswith("2.")

# =============================================================================
# Fern's UniversalBaseModel pattern
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

# =============================================================================
# Models
# =============================================================================

class OrEnvironmentFilter(UniversalBaseModel):
    filters: List["EnvironmentSearchFilter"]

    if IS_PYDANTIC_V2:
        model_config: ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid


class _EnvironmentSearchFilter:
    class Or(OrEnvironmentFilter):
        type: Literal["or"] = "or"

    class And(UniversalBaseModel):
        type: Literal["and"] = "and"
        filters: List["EnvironmentSearchFilter"]
        if IS_PYDANTIC_V2:
            model_config: ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
        else:
            class Config:
                extra = pydantic.Extra.forbid


class EnvironmentSearchFilter(UniversalRootModel):
    if IS_PYDANTIC_V2:
        root: Annotated[
            Union[_EnvironmentSearchFilter.Or, _EnvironmentSearchFilter.And],
            pydantic.Field(discriminator="type"),
        ]
    else:
        __root__: Annotated[
            Union[_EnvironmentSearchFilter.Or, _EnvironmentSearchFilter.And],
            pydantic.Field(discriminator="type"),
        ]


# Rebuild
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
# FastAPI App
# =============================================================================

app = FastAPI()

class SearchRequest(UniversalBaseModel):
    filter: EnvironmentSearchFilter
    if IS_PYDANTIC_V2:
        model_config: ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid

if IS_PYDANTIC_V2:
    SearchRequest.model_rebuild()
else:
    SearchRequest.update_forward_refs()


@app.post("/search")
def search(request: SearchRequest):
    return {"status": "ok"}


# =============================================================================
# Test
# =============================================================================

client = TestClient(app, raise_server_exceptions=False)

body = {"filter": {"type": "or", "filters": []}}
response = client.post("/search", json=body)

print(f"\nRequest: {body}")
print(f"Status: {response.status_code}")

if response.status_code == 422:
    print("*** BUG REPRODUCED! ***")
    print(f"Response: {response.json()}")
else:
    print(f"Response: {response.json()}")
    print("*** TEST PASSED ***")
