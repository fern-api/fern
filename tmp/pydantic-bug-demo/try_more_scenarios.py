"""
Let's try more scenarios to reproduce the bug.

Possible causes:
1. Different Pydantic config combinations
2. The way FastAPI actually validates request bodies
3. Nested unions
4. The order of class definition
5. Using model_construct vs __init__
"""

import pydantic
from typing import List, Literal, Union, ClassVar, Any, Dict
from typing_extensions import Annotated

print(f"Pydantic version: {pydantic.VERSION}")
print("=" * 60)


# =============================================================================
# Scenario 1: What if parent defines Config as a class (not model_config)?
# =============================================================================

print("\n" + "=" * 60)
print("SCENARIO 1: Parent uses class Config (old style)")
print("=" * 60)

class ParentWithClassConfig(pydantic.BaseModel):
    name: str

    class Config:
        extra = "forbid"

class ChildOfClassConfig(ParentWithClassConfig):
    type: Literal["child"] = "child"

try:
    result = ChildOfClassConfig(**{"type": "child", "name": "test"})
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# Scenario 2: What if we use strict mode?
# =============================================================================

print("\n" + "=" * 60)
print("SCENARIO 2: Parent uses strict=True")
print("=" * 60)

class ParentStrict(pydantic.BaseModel):
    name: str

    model_config = pydantic.ConfigDict(extra="forbid", strict=True)

class ChildOfStrict(ParentStrict):
    type: Literal["child"] = "child"

try:
    result = ChildOfStrict(**{"type": "child", "name": "test"})
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# Scenario 3: What if child also defines extra="forbid"?
# =============================================================================

print("\n" + "=" * 60)
print("SCENARIO 3: Both parent and child define extra='forbid'")
print("=" * 60)

class ParentForbid(pydantic.BaseModel):
    name: str
    model_config = pydantic.ConfigDict(extra="forbid")

class ChildAlsoForbid(ParentForbid):
    type: Literal["child"] = "child"
    model_config = pydantic.ConfigDict(extra="forbid")  # Child also has it

try:
    result = ChildAlsoForbid(**{"type": "child", "name": "test"})
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# Scenario 4: What if we use TypeAdapter directly?
# =============================================================================

print("\n" + "=" * 60)
print("SCENARIO 4: Using TypeAdapter (how FastAPI might do it)")
print("=" * 60)

class Base4(pydantic.BaseModel):
    filters: List[str]
    model_config = pydantic.ConfigDict(extra="forbid")

class _Union4:
    class Or(Base4):
        type: Literal["or"] = "or"

adapter = pydantic.TypeAdapter(_Union4.Or)

try:
    result = adapter.validate_python({"type": "or", "filters": []})
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# Scenario 5: What if we validate JSON string instead of dict?
# =============================================================================

print("\n" + "=" * 60)
print("SCENARIO 5: Validate from JSON string")
print("=" * 60)

import json
json_str = '{"type": "or", "filters": []}'

try:
    result = adapter.validate_json(json_str)
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# Scenario 6: What if parent has __init__ validation?
# =============================================================================

print("\n" + "=" * 60)
print("SCENARIO 6: Parent with custom validator")
print("=" * 60)

class ParentWithValidator(pydantic.BaseModel):
    name: str
    model_config = pydantic.ConfigDict(extra="forbid")

    @pydantic.model_validator(mode="before")
    @classmethod
    def check_fields(cls, data):
        # This might interfere with child fields
        return data

class ChildOfValidator(ParentWithValidator):
    type: Literal["child"] = "child"

try:
    result = ChildOfValidator(**{"type": "child", "name": "test"})
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# Scenario 7: What if we use validate_model directly?
# =============================================================================

print("\n" + "=" * 60)
print("SCENARIO 7: Different validation methods")
print("=" * 60)

class Base7(pydantic.BaseModel):
    filters: List[str]
    model_config = pydantic.ConfigDict(extra="forbid")

class Child7(Base7):
    type: Literal["or"] = "or"

data = {"type": "or", "filters": []}

print("Via __init__:")
try:
    result = Child7(**data)
    print(f"  SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"  FAILED: {e}")

print("Via model_validate:")
try:
    result = Child7.model_validate(data)
    print(f"  SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"  FAILED: {e}")

print("Via model_construct (no validation):")
try:
    result = Child7.model_construct(**data)
    print(f"  SUCCESS: {result}")
except Exception as e:
    print(f"  FAILED: {e}")


# =============================================================================
# Scenario 8: What if there's a naming conflict with 'type'?
# =============================================================================

print("\n" + "=" * 60)
print("SCENARIO 8: Field named 'type' (reserved word?)")
print("=" * 60)

class Base8(pydantic.BaseModel):
    name: str
    model_config = pydantic.ConfigDict(extra="forbid")

class Child8(Base8):
    type: str  # Not Literal, just str

try:
    result = Child8(**{"type": "anything", "name": "test"})
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# Scenario 9: Nested class definition (like Fern does)
# =============================================================================

print("\n" + "=" * 60)
print("SCENARIO 9: Nested class definition")
print("=" * 60)

class Base9(pydantic.BaseModel):
    filters: List[str]
    model_config = pydantic.ConfigDict(extra="forbid")

class _Container:
    class Or(Base9):
        type: Literal["or"] = "or"

# Does the nesting matter?
try:
    result = _Container.Or(**{"type": "or", "filters": []})
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# Scenario 10: What if we use frozen=True?
# =============================================================================

print("\n" + "=" * 60)
print("SCENARIO 10: Parent with frozen=True")
print("=" * 60)

class FrozenParent(pydantic.BaseModel):
    name: str
    model_config = pydantic.ConfigDict(extra="forbid", frozen=True)

class ChildOfFrozen(FrozenParent):
    type: Literal["child"] = "child"

try:
    result = ChildOfFrozen(**{"type": "child", "name": "test"})
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# Scenario 11: Using discriminated union with TypeAdapter
# =============================================================================

print("\n" + "=" * 60)
print("SCENARIO 11: Discriminated union via TypeAdapter")
print("=" * 60)

class Base11A(pydantic.BaseModel):
    value: str
    model_config = pydantic.ConfigDict(extra="forbid")

class Base11B(pydantic.BaseModel):
    count: int
    model_config = pydantic.ConfigDict(extra="forbid")

class _U11:
    class A(Base11A):
        type: Literal["a"] = "a"

    class B(Base11B):
        type: Literal["b"] = "b"

UnionType = Annotated[Union[_U11.A, _U11.B], pydantic.Field(discriminator="type")]
adapter11 = pydantic.TypeAdapter(UnionType)

try:
    result = adapter11.validate_python({"type": "a", "value": "test"})
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# Scenario 12: RootModel with discriminated union
# =============================================================================

print("\n" + "=" * 60)
print("SCENARIO 12: RootModel wrapper (exact Fern pattern)")
print("=" * 60)

class Base12(pydantic.BaseModel):
    filters: List[str]
    model_config = pydantic.ConfigDict(extra="forbid")

class _U12:
    class Or(Base12):
        type: Literal["or"] = "or"

    class And(Base12):
        type: Literal["and"] = "and"

class Wrapper12(pydantic.RootModel):
    root: Annotated[Union[_U12.Or, _U12.And], pydantic.Field(discriminator="type")]

try:
    result = Wrapper12.model_validate({"type": "or", "filters": []})
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")


# =============================================================================
# Scenario 13: Extra field that's NOT the discriminator
# =============================================================================

print("\n" + "=" * 60)
print("SCENARIO 13: Actually send an unknown extra field")
print("=" * 60)

try:
    result = _U12.Or(**{"type": "or", "filters": [], "unknown_field": "bad"})
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED (expected): {e.errors()[0]['type']} - {e.errors()[0]['msg']}")
