"""
Reproduces the FastAPI discriminated union bug - Pydantic V1 version.
"""

import pydantic
from typing import List, Literal, Union, ClassVar, Any, Dict
from typing_extensions import Annotated

print(f"Pydantic version: {pydantic.VERSION}")
print("=" * 60)

# =============================================================================
# Pydantic V1 pattern (matching Fern's generated code)
# =============================================================================

class UniversalBaseModel(pydantic.BaseModel):
    """Mimics Fern's UniversalBaseModel"""
    pass


# =============================================================================
# Base type with extra="forbid"
# =============================================================================

class Foo(UniversalBaseModel):
    name: str

    class Config:
        extra = pydantic.Extra.forbid


# =============================================================================
# Internal union member that inherits from Foo
# =============================================================================

class _UnionWithSubTypes:
    class Foo(Foo):  # Inherits from Foo
        type: Literal["foo"] = "foo"

    class Bar(UniversalBaseModel):
        type: Literal["bar"] = "bar"
        value: int

        class Config:
            extra = pydantic.Extra.forbid


class UnionWithSubTypes(pydantic.BaseModel):
    __root__: Annotated[
        Union[_UnionWithSubTypes.Foo, _UnionWithSubTypes.Bar],
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
    result = UnionWithSubTypes(__root__=java_sdk_json)
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")

print("\n--- Parse via UnionWithSubTypes.parse_obj ---")
try:
    result = UnionWithSubTypes.parse_obj(java_sdk_json)
    print(f"SUCCESS: {result}")
except pydantic.ValidationError as e:
    print(f"FAILED: {e}")

print("\n--- What fields does Foo know about? ---")
print(f"Foo (base) fields: {list(Foo.__fields__.keys())}")
print(f"_UnionWithSubTypes.Foo fields: {list(_UnionWithSubTypes.Foo.__fields__.keys())}")

print("\n--- Check extra config ---")
print(f"Foo extra config: {Foo.__config__.extra}")
print(f"_UnionWithSubTypes.Foo extra config: {_UnionWithSubTypes.Foo.__config__.extra}")
