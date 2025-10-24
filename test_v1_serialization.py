#!/usr/bin/env python3
"""
Test script to examine how Pydantic v1 transparent serialization works
Run this from the pydantic-v1-wrapped directory with: poetry run python /Users/tedsmith/Desktop/fern/test_v1_serialization.py
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

# Test the v1 alias
uuid_alias = UuidAlias.from_str('uuid:test-value')
print('uuid_alias.__root__:', uuid_alias.__root__)
print('UuidAlias.json():', uuid_alias.json())
print('UuidAlias.dict():', uuid_alias.dict())

# Test manual model_dump
try:
    print('UuidAlias.model_dump():', uuid_alias.model_dump())
except Exception as e:
    print('model_dump error:', e)

# Test what happens with direct access to the underlying pydantic methods
try:
    print('super().json():', super(UuidAlias, uuid_alias).json())
except Exception as e:
    print('super().json() error:', e)

# Check if it has a custom json method
print('UuidAlias.json method:', UuidAlias.json)
print('UuidAlias.dict method:', UuidAlias.dict)

# Test if it's using the UniversalBaseModel serialization
from seed.core.pydantic_utilities import UniversalBaseModel
print('Is instance of UniversalBaseModel:', isinstance(uuid_alias, UniversalBaseModel))
print('UniversalBaseModel.json method:', UniversalBaseModel.json)