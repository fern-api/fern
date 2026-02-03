"""
Reproduces the FastAPI discriminated union bug - matching Fern's exact pattern.

Let me try to match the exact pattern Fern generates more closely.
"""

import pydantic
from typing import List, Literal, Union, ClassVar, Any, Dict
from typing_extensions import Annotated

print(f"Pydantic version: {pydantic.VERSION}")
print("=" * 60)

# =============================================================================
# Try to match Fern's exact generated pattern with UniversalBaseModel
# =============================================================================

class UniversalBaseModel(pydantic.BaseModel):
    """Mimics Fern's UniversalBaseModel"""
    pass


class UniversalRootModel(pydantic.BaseModel):
    """Mimics Fern's UniversalRootModel"""
    pass


# =============================================================================
# EXACT pattern from seed/fastapi/unions/no-custom-config/resources/types/types/foo.py
# =============================================================================

class Foo(UniversalBaseModel):
    name: str

    model_config: ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(extra="forbid")


# =============================================================================
# EXACT pattern from seed/fastapi/unions/no-custom-config/resources/types/types/union_with_sub_types.py
# =============================================================================

class _UnionWithSubTypes:
    class Foo(Foo):  # Inherits from Foo
        type: Literal["foo"] = "foo"


class UnionWithSubTypes(UniversalRootModel):
    root: Annotated[
        Union[_UnionWithSubTypes.Foo],
        pydantic.Field(discriminator="type")
    ]


# =============================================================================
# Test
# =============================================================================

print("\n" + "=" * 60)
print("TEST: Parse JSON with discriminator (what Java SDK sends)")
print("=" * 60)

java_sdk_json = {"type": "foo", "name": "example"}
print(f"\nInput JSON: {java_sdk_json}")

print("\n--- Direct parse to _UnionWithSubTypes.Foo ---")
try:
    result = _UnionWithSubTypes.Foo(**java_sdk_json)
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")

print("\n--- Parse via UnionWithSubTypes wrapper ---")
try:
    result = UnionWithSubTypes(root=java_sdk_json)
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")

print("\n--- What fields does Foo know about? ---")
print(f"Foo (base) fields: {list(Foo.model_fields.keys())}")
print(f"_UnionWithSubTypes.Foo fields: {list(_UnionWithSubTypes.Foo.model_fields.keys())}")

print("\n--- Check extra config ---")
print(f"Foo extra config: {Foo.model_config.get('extra')}")
print(f"_UnionWithSubTypes.Foo extra config: {_UnionWithSubTypes.Foo.model_config.get('extra')}")
