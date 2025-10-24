#!/usr/bin/env python3
"""
Test script to examine how Pydantic v2 serialization currently works
Run this from the pydantic-v2-wrapped directory with: poetry run python /Users/tedsmith/Desktop/fern/test_v2_serialization.py
"""

import sys
import os

# Add the src directory to the path so we can import the seed modules
sys.path.insert(0, os.path.join(os.getcwd(), 'src'))

from seed.types.uuid_alias import UuidAlias
import json
import pydantic

print('Pydantic version:', pydantic.VERSION)
print('UuidAlias MRO:', UuidAlias.__mro__)

# Test the v2 alias
uuid_alias = UuidAlias.from_str('uuid:test-value')
print('uuid_alias.root:', uuid_alias.root)
print('UuidAlias.json():', uuid_alias.json())
print('UuidAlias.dict():', uuid_alias.dict())

# Test manual model_dump
try:
    print('UuidAlias.model_dump():', uuid_alias.model_dump())
    print('UuidAlias.model_dump_json():', uuid_alias.model_dump_json())
except Exception as e:
    print('model_dump error:', e)

# Test if it's a proper RootModel
print('Is RootModel?', isinstance(uuid_alias, pydantic.RootModel))

# Test what happens with direct access to the underlying pydantic methods
try:
    print('super().model_dump_json():', super(UuidAlias, uuid_alias).model_dump_json())
except Exception as e:
    print('super().model_dump_json() error:', e)

# Check if it has custom serialization methods
print('UuidAlias.json method:', UuidAlias.json)
print('UuidAlias.dict method:', UuidAlias.dict)

# Test if it's using the UniversalBaseModel serialization
from seed.core.pydantic_utilities import UniversalBaseModel, UniversalRootModel
print('Is instance of UniversalBaseModel:', isinstance(uuid_alias, UniversalBaseModel))
print('Is instance of UniversalRootModel:', isinstance(uuid_alias, UniversalRootModel))
print('UniversalBaseModel.json method:', UniversalBaseModel.json)
print('UniversalRootModel class:', UniversalRootModel)

# Test creating a proper UniversalRootModel directly
print('\n--- Testing UniversalRootModel directly ---')
try:
    class TestRootAlias(UniversalRootModel):
        root: str

    test_root = TestRootAlias(root='test-value')
    print('TestRootAlias.json():', test_root.json())
    print('TestRootAlias.model_dump():', test_root.model_dump())
    print('TestRootAlias.model_dump_json():', test_root.model_dump_json())
    print('Is TestRootAlias a RootModel?', isinstance(test_root, pydantic.RootModel))
except Exception as e:
    print('UniversalRootModel test error:', e)