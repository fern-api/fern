"""
Test how FastAPI actually parses request bodies.
FastAPI uses TypeAdapter for validation which might behave differently.
"""

from __future__ import annotations

import typing
import json

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
# Customer's pattern
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
# Request wrapper (like FastAPI endpoint body)
# =============================================================================

class SearchRequest(UniversalBaseModel):
    filter: EnvironmentSearchFilter

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid

update_forward_refs(SearchRequest)


# =============================================================================
# TESTS - Using TypeAdapter like FastAPI does
# =============================================================================

print("\n" + "=" * 60)
print("TEST 1: model_validate (normal pydantic)")
print("=" * 60)

json_data = {"filter": {"type": "or", "filters": []}}
print(f"JSON: {json_data}")

try:
    result = SearchRequest.model_validate(json_data)
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


print("\n" + "=" * 60)
print("TEST 2: TypeAdapter.validate_python (FastAPI uses this)")
print("=" * 60)

if IS_PYDANTIC_V2:
    adapter = pydantic.TypeAdapter(SearchRequest)
    try:
        result = adapter.validate_python(json_data)
        print(f"SUCCESS: {result}")
    except pydantic.ValidationError as e:
        print(f"FAILED: {e}")
else:
    print("SKIP: TypeAdapter is V2 only")


print("\n" + "=" * 60)
print("TEST 3: TypeAdapter.validate_json (parse from JSON string)")
print("=" * 60)

if IS_PYDANTIC_V2:
    json_str = json.dumps(json_data)
    print(f"JSON string: {json_str}")
    try:
        result = adapter.validate_json(json_str)
        print(f"SUCCESS: {result}")
    except pydantic.ValidationError as e:
        print(f"FAILED: {e}")
else:
    print("SKIP: TypeAdapter is V2 only")


print("\n" + "=" * 60)
print("TEST 4: Simulate FastAPI's body parsing with mode='python'")
print("=" * 60)

if IS_PYDANTIC_V2:
    # FastAPI first parses JSON to dict, then validates
    raw_json = '{"filter": {"type": "or", "filters": []}}'
    parsed_dict = json.loads(raw_json)
    print(f"Parsed dict: {parsed_dict}")

    try:
        result = adapter.validate_python(parsed_dict, strict=False)
        print(f"SUCCESS: {result}")
    except pydantic.ValidationError as e:
        print(f"FAILED: {e}")
else:
    print("SKIP: TypeAdapter is V2 only")


print("\n" + "=" * 60)
print("TEST 5: With extra unexpected field")
print("=" * 60)

json_with_extra = {"filter": {"type": "or", "filters": [], "unexpected": "value"}}
print(f"JSON with extra: {json_with_extra}")

try:
    result = SearchRequest.model_validate(json_with_extra)
    print(f"SUCCESS (should fail!): {result}")
except pydantic.ValidationError as e:
    print(f"CORRECTLY FAILED: {e}")


print("\n" + "=" * 60)
print("TEST 6: Validate 'type' field itself is not considered extra")
print("=" * 60)

print("Checking if 'type' is a known field in _EnvironmentSearchFilter.Or:")
print(f"  model_fields keys: {list(_EnvironmentSearchFilter.Or.model_fields.keys())}")
print(f"  'type' in model_fields: {'type' in _EnvironmentSearchFilter.Or.model_fields}")
