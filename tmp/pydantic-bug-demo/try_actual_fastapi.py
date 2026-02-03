"""
Let's try with actual FastAPI to see if it's a FastAPI-specific issue.
"""

import pydantic
from typing import List, Literal, Union, ClassVar
from typing_extensions import Annotated

print(f"Pydantic version: {pydantic.VERSION}")

try:
    from fastapi import FastAPI, Request
    from fastapi.testclient import TestClient
    print(f"FastAPI available!")
    HAS_FASTAPI = True
except ImportError:
    print("FastAPI not installed, skipping FastAPI tests")
    HAS_FASTAPI = False

if HAS_FASTAPI:
    print("=" * 60)

    # =============================================================================
    # Models (exact Fern pattern)
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

    class EnvironmentSearchFilter(pydantic.RootModel):
        root: Annotated[
            Union[_EnvironmentSearchFilter.Or, _EnvironmentSearchFilter.And],
            pydantic.Field(discriminator="type")
        ]

    # Rebuild for forward refs
    OrEnvironmentFilter.model_rebuild()
    _EnvironmentSearchFilter.Or.model_rebuild()
    _EnvironmentSearchFilter.And.model_rebuild()
    EnvironmentSearchFilter.model_rebuild()

    # =============================================================================
    # FastAPI App
    # =============================================================================

    app = FastAPI()

    @app.post("/search")
    def search(filter: EnvironmentSearchFilter):
        return {"received": str(filter)}

    # Also test nested in a request body
    class SearchRequest(pydantic.BaseModel):
        filter: EnvironmentSearchFilter
        model_config = pydantic.ConfigDict(extra="forbid")

    SearchRequest.model_rebuild()

    @app.post("/search2")
    def search2(request: SearchRequest):
        return {"received": str(request)}

    # =============================================================================
    # Test with TestClient
    # =============================================================================

    client = TestClient(app, raise_server_exceptions=False)

    print("\n" + "=" * 60)
    print("TEST 1: POST to /search with direct union")
    print("=" * 60)

    response = client.post("/search", json={"type": "or", "filters": []})
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

    print("\n" + "=" * 60)
    print("TEST 2: POST to /search2 with nested filter")
    print("=" * 60)

    response = client.post("/search2", json={"filter": {"type": "or", "filters": []}})
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

    print("\n" + "=" * 60)
    print("TEST 3: POST with actual extra field (should fail)")
    print("=" * 60)

    response = client.post("/search", json={"type": "or", "filters": [], "bad_field": "x"})
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

    print("\n" + "=" * 60)
    print("TEST 4: POST with 'and' type")
    print("=" * 60)

    response = client.post("/search", json={"type": "and", "filters": []})
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
