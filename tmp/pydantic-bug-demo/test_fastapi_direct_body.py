"""
Test the EXACT Fern FastAPI pattern where the body is directly a union type.

The error: "loc": ["body", "filter"], "msg": "Extra inputs are not permitted"
suggests that when FastAPI receives {"filter": {...}}, it's wrapping it somehow.

Let me test various FastAPI body parsing scenarios.
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
# Simulate Fern's pydantic_utilities.py
# =============================================================================

class UniversalBaseModel(pydantic.BaseModel):
    class Config:
        populate_by_name = True
        smart_union = True
        allow_population_by_field_name = True
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


def update_forward_refs(model: typing.Type, **localns: typing.Any) -> None:
    if IS_PYDANTIC_V2:
        model.model_rebuild(raise_errors=False)
    else:
        model.update_forward_refs(**localns)


# =============================================================================
# Circle / Square pattern from seed test
# =============================================================================

class Circle(UniversalBaseModel):
    radius: float

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid


class Square(UniversalBaseModel):
    side: float

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid


class _Shape:
    class Circle(Circle):
        type: typing.Literal["circle"] = "circle"

    class Square(Square):
        type: typing.Literal["square"] = "square"


class Shape(UniversalRootModel):
    if IS_PYDANTIC_V2:
        root: typing_extensions.Annotated[
            typing.Union[_Shape.Circle, _Shape.Square],
            pydantic.Field(discriminator="type")
        ]
    else:
        __root__: typing_extensions.Annotated[
            typing.Union[_Shape.Circle, _Shape.Square],
            pydantic.Field(discriminator="type")
        ]

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        if IS_PYDANTIC_V2:
            return self.root.dict(**kwargs)
        else:
            return self.__root__.dict(**kwargs)


update_forward_refs(_Shape.Circle)
update_forward_refs(_Shape.Square)
update_forward_refs(Shape)


# =============================================================================
# Request wrapper model (customer's pattern)
# =============================================================================

class SearchRequest(UniversalBaseModel):
    filter: Shape  # This is like "filter: EnvironmentSearchFilter"

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid


update_forward_refs(SearchRequest)


# =============================================================================
# FastAPI app
# =============================================================================

app = FastAPI()


# Endpoint 1: Body is directly the Shape union
@app.patch("/direct")
def update_direct(body: Shape = Body(...)) -> dict:
    return {"status": "ok", "type": body.root.type if IS_PYDANTIC_V2 else body.__root__.type}


# Endpoint 2: Body is a wrapper model with 'filter' field
@app.post("/search")
def search(body: SearchRequest) -> dict:
    return {"status": "ok"}


# Endpoint 3: Using embed=True (forces wrapping)
@app.post("/search-embed")
def search_embed(filter: Shape = Body(..., embed=True)) -> dict:
    return {"status": "ok"}


client = TestClient(app, raise_server_exceptions=False)


# =============================================================================
# TESTS
# =============================================================================

print("\n" + "=" * 60)
print("TEST 1: Direct body (Shape union)")
print("=" * 60)

body = {"type": "circle", "radius": 5.0}
print(f"Request: {body}")
response = client.patch("/direct", json=body)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")


print("\n" + "=" * 60)
print("TEST 2: Wrapped body (SearchRequest with filter field)")
print("=" * 60)

body = {"filter": {"type": "circle", "radius": 5.0}}
print(f"Request: {body}")
response = client.post("/search", json=body)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

if response.status_code == 422:
    print("\n*** BUG REPRODUCED! ***")
    for err in response.json().get("detail", []):
        print(f"  loc: {err.get('loc')}")
        print(f"  type: {err.get('type')}")
        print(f"  msg: {err.get('msg')}")


print("\n" + "=" * 60)
print("TEST 3: Embedded body (filter with embed=True)")
print("=" * 60)

body = {"filter": {"type": "circle", "radius": 5.0}}
print(f"Request: {body}")
response = client.post("/search-embed", json=body)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")


print("\n" + "=" * 60)
print("TEST 4: What if we send wrong structure to /search?")
print("=" * 60)

# What if someone sends the union directly without wrapping in 'filter'?
body = {"type": "circle", "radius": 5.0}
print(f"Request (no wrapper): {body}")
response = client.post("/search", json=body)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")


print("\n" + "=" * 60)
print("TEST 5: Check model fields")
print("=" * 60)

print(f"SearchRequest.model_fields: {SearchRequest.model_fields}")
print(f"SearchRequest.model_config: {SearchRequest.model_config}")
