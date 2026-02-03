"""
The changelog mentions:
1.12.1: "Fix discriminated union Field(discriminator=...) to use Python field names
         instead of JSON aliases for Pydantic v2 compatibility"

Maybe the issue is related to this - let's test with aliases.
"""

from __future__ import annotations
import typing
import pydantic
import typing_extensions

print(f"Pydantic version: {pydantic.VERSION}")
IS_PYDANTIC_V2 = pydantic.VERSION.startswith("2.")

# =============================================================================
# Maybe the issue is with JSON alias vs Python field name for discriminator?
# =============================================================================

print("\n" + "=" * 60)
print("TEST: Discriminator using alias vs field name")
print("=" * 60)

class Base(pydantic.BaseModel):
    filters: typing.List[str]
    model_config = pydantic.ConfigDict(extra="forbid", populate_by_name=True)


class _Union:
    class Or(Base):
        # What if the discriminator uses an alias?
        filter_type: typing.Literal["or"] = pydantic.Field(default="or", alias="type")

    class And(Base):
        filter_type: typing.Literal["and"] = pydantic.Field(default="and", alias="type")


# Test with alias as discriminator
print("\nUsing alias 'type' as discriminator:")
try:
    class FilterWithAlias(pydantic.RootModel):
        root: typing_extensions.Annotated[
            typing.Union[_Union.Or, _Union.And],
            pydantic.Field(discriminator="type"),  # Using alias
        ]

    result = FilterWithAlias.model_validate({"type": "or", "filters": []})
    print(f"SUCCESS: {result}")
except Exception as e:
    print(f"FAILED: {type(e).__name__}: {e}")


# Test with field name as discriminator
print("\nUsing field name 'filter_type' as discriminator:")
try:
    class FilterWithFieldName(pydantic.RootModel):
        root: typing_extensions.Annotated[
            typing.Union[_Union.Or, _Union.And],
            pydantic.Field(discriminator="filter_type"),  # Using field name
        ]

    result = FilterWithFieldName.model_validate({"type": "or", "filters": []})
    print(f"SUCCESS: {result}")
except Exception as e:
    print(f"FAILED: {type(e).__name__}: {e}")


# =============================================================================
# What if discriminator field has no alias (standard case)?
# =============================================================================

print("\n" + "=" * 60)
print("TEST: Standard discriminator (no alias)")
print("=" * 60)

class Base2(pydantic.BaseModel):
    filters: typing.List[str]
    model_config = pydantic.ConfigDict(extra="forbid")


class _Union2:
    class Or(Base2):
        type: typing.Literal["or"] = "or"  # No alias, field name = "type"

    class And(Base2):
        type: typing.Literal["and"] = "and"


class Filter2(pydantic.RootModel):
    root: typing_extensions.Annotated[
        typing.Union[_Union2.Or, _Union2.And],
        pydantic.Field(discriminator="type"),
    ]

result = Filter2.model_validate({"type": "or", "filters": []})
print(f"SUCCESS: {result}")


# =============================================================================
# Check actual model fields
# =============================================================================

print("\n" + "=" * 60)
print("DEBUG: Model field info")
print("=" * 60)

print(f"\n_Union.Or.model_fields:")
for name, field in _Union.Or.model_fields.items():
    print(f"  {name}: alias={field.alias}, default={field.default}")

print(f"\n_Union2.Or.model_fields:")
for name, field in _Union2.Or.model_fields.items():
    print(f"  {name}: alias={field.alias}, default={field.default}")
