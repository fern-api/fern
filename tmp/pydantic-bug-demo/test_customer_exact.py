"""
EXACT reproduction of customer's files.

Key observation: _EnvironmentSearchFilter is defined AFTER EnvironmentSearchFilter
uses it in the type annotation! This is a forward reference pattern.
"""

from __future__ import annotations

import typing

import pydantic
import typing_extensions

print(f"Pydantic version: {pydantic.VERSION}")
IS_PYDANTIC_V2 = pydantic.VERSION.startswith("2.")
print(f"IS_PYDANTIC_V2: {IS_PYDANTIC_V2}")

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
        kwargs_with_defaults = {
            "by_alias": True,
            "exclude_unset": True,
            **kwargs,
        }
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
# or_environment_filter.py (EXACT)
# =============================================================================

class OrEnvironmentFilter(UniversalBaseModel):
    filters: typing.List["EnvironmentSearchFilter"]

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid


# =============================================================================
# and_environment_filter.py (similar pattern)
# =============================================================================

class AndEnvironmentFilter(UniversalBaseModel):
    filters: typing.List["EnvironmentSearchFilter"]

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid


# =============================================================================
# environment_search_filter.py (EXACT - note class order!)
# =============================================================================

T_Result = typing.TypeVar("T_Result")


class _Factory:
    def and_(self, value: AndEnvironmentFilter) -> "EnvironmentSearchFilter":
        if IS_PYDANTIC_V2:
            return EnvironmentSearchFilter(
                root=_EnvironmentSearchFilter.And(**value.dict(exclude_unset=True), type="and")
            )
        else:
            return EnvironmentSearchFilter(
                __root__=_EnvironmentSearchFilter.And(**value.dict(exclude_unset=True), type="and")
            )

    def or_(self, value: OrEnvironmentFilter) -> "EnvironmentSearchFilter":
        if IS_PYDANTIC_V2:
            return EnvironmentSearchFilter(
                root=_EnvironmentSearchFilter.Or(**value.dict(exclude_unset=True), type="or")
            )
        else:
            return EnvironmentSearchFilter(
                __root__=_EnvironmentSearchFilter.Or(**value.dict(exclude_unset=True), type="or")
            )


# NOTE: EnvironmentSearchFilter is defined HERE, BEFORE _EnvironmentSearchFilter!
# It references _EnvironmentSearchFilter.And, _EnvironmentSearchFilter.Or etc
# which don't exist yet!

class EnvironmentSearchFilter(UniversalRootModel):
    factory: typing.ClassVar[_Factory] = _Factory()

    if IS_PYDANTIC_V2:
        root: typing_extensions.Annotated[
            typing.Union[
                "_EnvironmentSearchFilter.And",
                "_EnvironmentSearchFilter.Or",
            ],
            pydantic.Field(discriminator="type"),
        ]

        def get_as_union(self):
            return self.root
    else:
        __root__: typing_extensions.Annotated[
            typing.Union[
                "_EnvironmentSearchFilter.And",
                "_EnvironmentSearchFilter.Or",
            ],
            pydantic.Field(discriminator="type"),
        ]

        def get_as_union(self):
            return self.__root__

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        if IS_PYDANTIC_V2:
            return self.root.dict(**kwargs)
        else:
            return self.__root__.dict(**kwargs)


# NOTE: _EnvironmentSearchFilter is defined AFTER EnvironmentSearchFilter!
# This is the forward reference pattern.

class _EnvironmentSearchFilter:
    class And(AndEnvironmentFilter):
        type: typing.Literal["and"] = "and"

    class Or(OrEnvironmentFilter):
        type: typing.Literal["or"] = "or"


# Update forward refs (EXACT order from customer's file)
update_forward_refs(_EnvironmentSearchFilter.And)
update_forward_refs(_EnvironmentSearchFilter.Or)
update_forward_refs(EnvironmentSearchFilter)
update_forward_refs(OrEnvironmentFilter)
update_forward_refs(AndEnvironmentFilter)


# =============================================================================
# TESTS
# =============================================================================

print("\n" + "=" * 60)
print("TEST 1: Direct parse of _EnvironmentSearchFilter.Or")
print("=" * 60)

json_data = {"type": "or", "filters": []}
print(f"JSON: {json_data}")

try:
    result = _EnvironmentSearchFilter.Or(**json_data)
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


print("\n" + "=" * 60)
print("TEST 2: Parse via EnvironmentSearchFilter")
print("=" * 60)

try:
    result = EnvironmentSearchFilter.model_validate(json_data)
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


print("\n" + "=" * 60)
print("TEST 3: FastAPI endpoint")
print("=" * 60)

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
        print(f"  input: {err.get('input')}")


print("\n" + "=" * 60)
print("TEST 4: Check model fields")
print("=" * 60)

print(f"OrEnvironmentFilter.model_fields: {list(OrEnvironmentFilter.model_fields.keys())}")
print(f"_EnvironmentSearchFilter.Or.model_fields: {list(_EnvironmentSearchFilter.Or.model_fields.keys())}")
print(f"_EnvironmentSearchFilter.Or.__bases__: {_EnvironmentSearchFilter.Or.__bases__}")

if IS_PYDANTIC_V2:
    print(f"OrEnvironmentFilter.model_config: {OrEnvironmentFilter.model_config}")
    print(f"_EnvironmentSearchFilter.Or.model_config: {_EnvironmentSearchFilter.Or.model_config}")
