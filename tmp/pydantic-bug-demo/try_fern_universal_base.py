"""
Try with Fern's exact UniversalBaseModel pattern.

The key thing is UniversalBaseModel has its own Config class.
Maybe there's something about multiple Config inheritance?
"""

import pydantic
from typing import List, Literal, Union, ClassVar, Any, Dict
from typing_extensions import Annotated
import datetime as dt

print(f"Pydantic version: {pydantic.VERSION}")

from fastapi import FastAPI
from fastapi.testclient import TestClient

print("=" * 60)

# =============================================================================
# EXACT UniversalBaseModel from Fern
# =============================================================================

IS_PYDANTIC_V2 = pydantic.VERSION.startswith("2.")

class UniversalBaseModel(pydantic.BaseModel):
    """Exact copy from Fern's pydantic_utilities.py"""

    class Config:
        populate_by_name = True
        smart_union = True
        allow_population_by_field_name = True
        protected_namespaces = ()

    def dict(self, **kwargs: Any) -> Dict[str, Any]:
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


# =============================================================================
# Models using UniversalBaseModel (Fern pattern)
# =============================================================================

class OrEnvironmentFilter(UniversalBaseModel):
    filters: List["EnvironmentSearchFilter"]

    # This is the key - it has BOTH the inherited Config AND model_config
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
OrEnvironmentFilter.model_rebuild()
_EnvironmentSearchFilter.Or.model_rebuild()
_EnvironmentSearchFilter.And.model_rebuild()
EnvironmentSearchFilter.model_rebuild()


# =============================================================================
# FastAPI App with EXACT Fern service pattern
# =============================================================================

app = FastAPI()

class SearchRequest(UniversalBaseModel):
    filter: EnvironmentSearchFilter

    if IS_PYDANTIC_V2:
        model_config: ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid

SearchRequest.model_rebuild()


@app.post("/search")
def search(request: SearchRequest):
    return {"received": str(request)}


# =============================================================================
# Test
# =============================================================================

client = TestClient(app, raise_server_exceptions=False)

print("\n" + "=" * 60)
print("TEST: POST with nested filter (customer's exact scenario)")
print("=" * 60)

body = {"filter": {"type": "or", "filters": []}}
print(f"Request body: {body}")

response = client.post("/search", json=body)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

if response.status_code == 422:
    print("\n*** BUG REPRODUCED! ***")
    for error in response.json().get("detail", []):
        print(f"  type: {error.get('type')}")
        print(f"  loc: {error.get('loc')}")
        print(f"  msg: {error.get('msg')}")
        print(f"  input: {error.get('input')}")


print("\n" + "=" * 60)
print("DEBUG: Config inheritance")
print("=" * 60)

print(f"\nUniversalBaseModel.model_config: {UniversalBaseModel.model_config}")
print(f"OrEnvironmentFilter.model_config: {OrEnvironmentFilter.model_config}")
print(f"_EnvironmentSearchFilter.Or.model_config: {_EnvironmentSearchFilter.Or.model_config}")

print(f"\n_EnvironmentSearchFilter.Or fields: {list(_EnvironmentSearchFilter.Or.model_fields.keys())}")
print(f"_EnvironmentSearchFilter.Or bases: {_EnvironmentSearchFilter.Or.__bases__}")
