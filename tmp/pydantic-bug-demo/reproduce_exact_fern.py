"""
EXACT reproduction using Fern's actual generated patterns.
"""

import datetime as dt
import pydantic
from typing import Any, Dict, List, Literal, Union, ClassVar, TypeVar
from typing_extensions import Annotated, TypeAlias

print(f"Pydantic version: {pydantic.VERSION}")
IS_PYDANTIC_V2 = pydantic.VERSION.startswith("2.")
print(f"IS_PYDANTIC_V2: {IS_PYDANTIC_V2}")
print("=" * 60)


# =============================================================================
# EXACT copy from Fern's pydantic_utilities.py
# =============================================================================

class UniversalBaseModel(pydantic.BaseModel):
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
    UniversalRootModel: TypeAlias = V2RootModel
else:
    UniversalRootModel: TypeAlias = UniversalBaseModel


def update_forward_refs(model, **localns: Any) -> None:
    if IS_PYDANTIC_V2:
        model.model_rebuild(raise_errors=False)
    else:
        model.update_forward_refs(**localns)


# =============================================================================
# EXACT copy from or_environment_filter.py (base type)
# =============================================================================

class OrEnvironmentFilter(UniversalBaseModel):
    filters: List["EnvironmentSearchFilter"]

    if IS_PYDANTIC_V2:
        model_config: ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid


# =============================================================================
# EXACT copy from environment_search_filter.py (union type)
# =============================================================================

T_Result = TypeVar("T_Result")


class _Factory:
    def or_(self, value: OrEnvironmentFilter) -> "EnvironmentSearchFilter":
        if IS_PYDANTIC_V2:
            return EnvironmentSearchFilter(
                root=_EnvironmentSearchFilter.Or(**value.dict(exclude_unset=True), type="or")
            )
        else:
            return EnvironmentSearchFilter(
                __root__=_EnvironmentSearchFilter.Or(**value.dict(exclude_unset=True), type="or")
            )


class EnvironmentSearchFilter(UniversalRootModel):
    factory: ClassVar[_Factory] = _Factory()

    if IS_PYDANTIC_V2:
        root: Annotated[
            Union["_EnvironmentSearchFilter.Or", "_EnvironmentSearchFilter.And"],
            pydantic.Field(discriminator="type"),
        ]

        def get_as_union(self):
            return self.root
    else:
        __root__: Annotated[
            Union["_EnvironmentSearchFilter.Or", "_EnvironmentSearchFilter.And"],
            pydantic.Field(discriminator="type"),
        ]

        def get_as_union(self):
            return self.__root__

    def dict(self, **kwargs: Any) -> Dict[str, Any]:
        if IS_PYDANTIC_V2:
            return self.root.dict(**kwargs)
        else:
            return self.__root__.dict(**kwargs)


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


# Update forward refs
update_forward_refs(OrEnvironmentFilter)
update_forward_refs(_EnvironmentSearchFilter.Or)
update_forward_refs(_EnvironmentSearchFilter.And)
update_forward_refs(EnvironmentSearchFilter)


# =============================================================================
# TESTS
# =============================================================================

print("\n" + "=" * 60)
print("TEST 1: Direct parse of internal union member")
print("=" * 60)

raw_json = {"type": "or", "filters": []}
print(f"\nInput: {raw_json}")

try:
    result = _EnvironmentSearchFilter.Or(**raw_json)
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


print("\n" + "=" * 60)
print("TEST 2: Parse via RootModel wrapper")
print("=" * 60)

try:
    if IS_PYDANTIC_V2:
        result = EnvironmentSearchFilter.model_validate(raw_json)
    else:
        result = EnvironmentSearchFilter.parse_obj(raw_json)
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


print("\n" + "=" * 60)
print("TEST 3: Nested in request (like FastAPI endpoint)")
print("=" * 60)

class SearchRequest(pydantic.BaseModel):
    filter: EnvironmentSearchFilter

    if IS_PYDANTIC_V2:
        model_config: ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")
    else:
        class Config:
            extra = pydantic.Extra.forbid


if IS_PYDANTIC_V2:
    SearchRequest.model_rebuild()

request_body = {"filter": {"type": "or", "filters": []}}
print(f"\nRequest body: {request_body}")

try:
    if IS_PYDANTIC_V2:
        result = SearchRequest.model_validate(request_body)
    else:
        result = SearchRequest.parse_obj(request_body)
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED!")
    for error in e.errors():
        print(f"  type: {error['type']}")
        print(f"  loc: {error['loc']}")
        print(f"  msg: {error['msg']}")
        if 'input' in error:
            print(f"  input: {error['input']}")


print("\n" + "=" * 60)
print("DEBUG: Check field definitions and config inheritance")
print("=" * 60)

print(f"\nOrEnvironmentFilter fields: {list(OrEnvironmentFilter.model_fields.keys()) if IS_PYDANTIC_V2 else list(OrEnvironmentFilter.__fields__.keys())}")
print(f"_EnvironmentSearchFilter.Or fields: {list(_EnvironmentSearchFilter.Or.model_fields.keys()) if IS_PYDANTIC_V2 else list(_EnvironmentSearchFilter.Or.__fields__.keys())}")

if IS_PYDANTIC_V2:
    print(f"\nOrEnvironmentFilter.model_config: {OrEnvironmentFilter.model_config}")
    print(f"_EnvironmentSearchFilter.Or.model_config: {_EnvironmentSearchFilter.Or.model_config}")
