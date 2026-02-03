"""
Test the ACTUAL error: "loc": ["body", "filter"], "msg": "Extra inputs are not permitted"

This means the 'filter' field itself is not recognized in the request model.
"""

from __future__ import annotations

import typing
import json

import pydantic
import typing_extensions

print(f"Pydantic version: {pydantic.VERSION}")
IS_PYDANTIC_V2 = pydantic.VERSION.startswith("2.")

# =============================================================================
# Simulate Fern's pydantic_utilities.py
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


def update_forward_refs(model: typing.Type, **localns: typing.Any) -> None:
    if IS_PYDANTIC_V2:
        model.model_rebuild(raise_errors=False)
    else:
        model.update_forward_refs(**localns)


# =============================================================================
# Filter models (customer's pattern)
# =============================================================================

class OrEnvironmentFilter(UniversalBaseModel):
    filters: typing.List["EnvironmentSearchFilter"]

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid


class AndEnvironmentFilter(UniversalBaseModel):
    filters: typing.List["EnvironmentSearchFilter"]

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid


class EnvironmentSearchFilter(UniversalRootModel):
    if IS_PYDANTIC_V2:
        root: typing_extensions.Annotated[
            typing.Union[
                "_EnvironmentSearchFilter.And",
                "_EnvironmentSearchFilter.Or",
            ],
            pydantic.Field(discriminator="type"),
        ]
    else:
        __root__: typing_extensions.Annotated[
            typing.Union[
                "_EnvironmentSearchFilter.And",
                "_EnvironmentSearchFilter.Or",
            ],
            pydantic.Field(discriminator="type"),
        ]


class _EnvironmentSearchFilter:
    class And(AndEnvironmentFilter):
        type: typing.Literal["and"] = "and"

    class Or(OrEnvironmentFilter):
        type: typing.Literal["or"] = "or"


# Update forward refs
update_forward_refs(_EnvironmentSearchFilter.And)
update_forward_refs(_EnvironmentSearchFilter.Or)
update_forward_refs(EnvironmentSearchFilter)
update_forward_refs(OrEnvironmentFilter)
update_forward_refs(AndEnvironmentFilter)


# =============================================================================
# Request wrapper - THIS IS WHERE THE ISSUE MIGHT BE
# =============================================================================

class SearchEnvironmentsRequest(UniversalBaseModel):
    """The request model that wraps the filter"""
    filter: EnvironmentSearchFilter

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid

update_forward_refs(SearchEnvironmentsRequest)


# =============================================================================
# TESTS
# =============================================================================

print("\n" + "=" * 60)
print("TEST 1: Check SearchEnvironmentsRequest.model_fields")
print("=" * 60)

print(f"SearchEnvironmentsRequest.model_fields: {SearchEnvironmentsRequest.model_fields}")
print(f"'filter' in model_fields: {'filter' in SearchEnvironmentsRequest.model_fields}")

if 'filter' in SearchEnvironmentsRequest.model_fields:
    field_info = SearchEnvironmentsRequest.model_fields['filter']
    print(f"filter field annotation: {field_info.annotation}")


print("\n" + "=" * 60)
print("TEST 2: Parse the exact failing payload")
print("=" * 60)

json_data = {"filter": {"type": "or", "filters": []}}
print(f"JSON: {json_data}")

try:
    result = SearchEnvironmentsRequest.model_validate(json_data)
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")
    for err in e.errors():
        print(f"  loc: {err['loc']}")
        print(f"  type: {err['type']}")
        print(f"  msg: {err['msg']}")


print("\n" + "=" * 60)
print("TEST 3: What if 'filter' has an alias?")
print("=" * 60)

class RequestWithAlias(UniversalBaseModel):
    filter_field: EnvironmentSearchFilter = pydantic.Field(alias="filter")

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid

update_forward_refs(RequestWithAlias)

print(f"RequestWithAlias.model_fields: {RequestWithAlias.model_fields}")

try:
    result = RequestWithAlias.model_validate(json_data)
    print(f"SUCCESS with alias: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED with alias: {e}")


print("\n" + "=" * 60)
print("TEST 4: Check model config inheritance")
print("=" * 60)

print(f"UniversalBaseModel.model_config: {UniversalBaseModel.model_config}")
print(f"SearchEnvironmentsRequest.model_config: {SearchEnvironmentsRequest.model_config}")


print("\n" + "=" * 60)
print("TEST 5: Check for field name conflicts with 'filter'")
print("=" * 60)

# Maybe 'filter' is a reserved name?
print(f"Is 'filter' a Python builtin? {filter.__class__}")
print(f"hasattr(pydantic.BaseModel, 'filter'): {hasattr(pydantic.BaseModel, 'filter')}")
