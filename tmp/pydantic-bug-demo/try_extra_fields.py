"""
Try with extra fields on the models - maybe there's something about
specific field names like 'loc', 'type', etc that causes issues.
"""

import pydantic
from typing import List, Literal, Union, ClassVar, Any, Dict, Optional
from typing_extensions import Annotated

print(f"Pydantic version: {pydantic.VERSION}")

from fastapi import FastAPI
from fastapi.testclient import TestClient

print("=" * 60)

# =============================================================================
# Test 1: Parent has a field called "type" already
# =============================================================================

print("\n" + "=" * 60)
print("TEST 1: Parent already has a 'type' field")
print("=" * 60)

class ParentWithType(pydantic.BaseModel):
    filters: List[str]
    type: Optional[str] = None  # Parent ALSO has type field!
    model_config = pydantic.ConfigDict(extra="forbid")

class _Union1:
    class Or(ParentWithType):
        type: Literal["or"] = "or"  # Child overrides with Literal

try:
    result = _Union1.Or(**{"type": "or", "filters": []})
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# Test 2: Parent has 'loc' field (like error messages)
# =============================================================================

print("\n" + "=" * 60)
print("TEST 2: Parent has 'loc' field")
print("=" * 60)

class ParentWithLoc(pydantic.BaseModel):
    filters: List[str]
    loc: Optional[str] = None
    model_config = pydantic.ConfigDict(extra="forbid")

class _Union2:
    class Or(ParentWithLoc):
        type: Literal["or"] = "or"

try:
    result = _Union2.Or(**{"type": "or", "filters": [], "loc": "somewhere"})
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# Test 3: Parent has 'input' field
# =============================================================================

print("\n" + "=" * 60)
print("TEST 3: Parent has 'input' field")
print("=" * 60)

class ParentWithInput(pydantic.BaseModel):
    filters: List[str]
    input: Optional[str] = None
    model_config = pydantic.ConfigDict(extra="forbid")

class _Union3:
    class Or(ParentWithInput):
        type: Literal["or"] = "or"

try:
    result = _Union3.Or(**{"type": "or", "filters": [], "input": "test"})
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# Test 4: Parent has 'msg' field
# =============================================================================

print("\n" + "=" * 60)
print("TEST 4: Parent has 'msg' field")
print("=" * 60)

class ParentWithMsg(pydantic.BaseModel):
    filters: List[str]
    msg: Optional[str] = None
    model_config = pydantic.ConfigDict(extra="forbid")

class _Union4:
    class Or(ParentWithMsg):
        type: Literal["or"] = "or"

try:
    result = _Union4.Or(**{"type": "or", "filters": [], "msg": "hello"})
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# Test 5: Many extra fields on parent
# =============================================================================

print("\n" + "=" * 60)
print("TEST 5: Parent has many fields")
print("=" * 60)

class BigParent(pydantic.BaseModel):
    filters: List[str]
    name: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    model_config = pydantic.ConfigDict(extra="forbid")

class _Union5:
    class Or(BigParent):
        type: Literal["or"] = "or"

try:
    result = _Union5.Or(**{"type": "or", "filters": [], "name": "test"})
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# Test 6: Field with alias that conflicts
# =============================================================================

print("\n" + "=" * 60)
print("TEST 6: Field with alias")
print("=" * 60)

class ParentWithAlias(pydantic.BaseModel):
    filters: List[str]
    type_name: str = pydantic.Field(default="", alias="typeName")
    model_config = pydantic.ConfigDict(extra="forbid", populate_by_name=True)

class _Union6:
    class Or(ParentWithAlias):
        type: Literal["or"] = "or"

try:
    result = _Union6.Or(**{"type": "or", "filters": [], "typeName": "test"})
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# Test 7: Multiple inheritance
# =============================================================================

print("\n" + "=" * 60)
print("TEST 7: Multiple inheritance")
print("=" * 60)

class Mixin:
    extra_field: str = "default"

class ParentMulti(pydantic.BaseModel):
    filters: List[str]
    model_config = pydantic.ConfigDict(extra="forbid")

class _Union7:
    class Or(ParentMulti, Mixin):  # Multiple inheritance
        type: Literal["or"] = "or"

try:
    result = _Union7.Or(**{"type": "or", "filters": []})
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# Test 8: Private fields
# =============================================================================

print("\n" + "=" * 60)
print("TEST 8: Parent with private fields")
print("=" * 60)

class ParentWithPrivate(pydantic.BaseModel):
    filters: List[str]
    _internal: str = pydantic.PrivateAttr(default="private")
    model_config = pydantic.ConfigDict(extra="forbid")

class _Union8:
    class Or(ParentWithPrivate):
        type: Literal["or"] = "or"

try:
    result = _Union8.Or(**{"type": "or", "filters": []})
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# Test 9: Computed fields
# =============================================================================

print("\n" + "=" * 60)
print("TEST 9: Parent with computed fields")
print("=" * 60)

class ParentWithComputed(pydantic.BaseModel):
    filters: List[str]
    model_config = pydantic.ConfigDict(extra="forbid")

    @pydantic.computed_field
    @property
    def filter_count(self) -> int:
        return len(self.filters)

class _Union9:
    class Or(ParentWithComputed):
        type: Literal["or"] = "or"

try:
    result = _Union9.Or(**{"type": "or", "filters": ["a", "b"]})
    print(f"SUCCESS: {result}")
    print(f"  filter_count: {result.filter_count}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# Test 10: Full FastAPI test with all edge cases
# =============================================================================

print("\n" + "=" * 60)
print("TEST 10: Full FastAPI with complex models")
print("=" * 60)

app = FastAPI()

class ComplexFilter(pydantic.BaseModel):
    filters: List["ComplexUnion"]
    name: Optional[str] = None
    loc: Optional[str] = None  # Potentially conflicting name
    model_config = pydantic.ConfigDict(extra="forbid")

class _ComplexUnion:
    class Or(ComplexFilter):
        type: Literal["or"] = "or"

    class And(ComplexFilter):
        type: Literal["and"] = "and"

class ComplexUnion(pydantic.RootModel):
    root: Annotated[
        Union[_ComplexUnion.Or, _ComplexUnion.And],
        pydantic.Field(discriminator="type")
    ]

ComplexFilter.model_rebuild()
_ComplexUnion.Or.model_rebuild()
_ComplexUnion.And.model_rebuild()
ComplexUnion.model_rebuild()

class ComplexRequest(pydantic.BaseModel):
    filter: ComplexUnion
    model_config = pydantic.ConfigDict(extra="forbid")

ComplexRequest.model_rebuild()

@app.post("/complex")
def complex_search(request: ComplexRequest):
    return {"status": "ok"}

client = TestClient(app, raise_server_exceptions=False)

# Test with loc field
body = {"filter": {"type": "or", "filters": [], "loc": "somewhere", "name": "test"}}
print(f"\nRequest: {body}")
response = client.post("/complex", json=body)
print(f"Status: {response.status_code}")
if response.status_code == 422:
    print(f"FAILED: {response.json()}")
else:
    print(f"SUCCESS: {response.json()}")
