#!/usr/bin/env python3
"""Simple test script to import and test OptionalAlias"""

from .resources.types import OptionalAlias
from . import validations
from .register import register_validators

register_validators(validations)

# Debug: Check if validators are registered
print(f"DEBUG: Registered validators: {OptionalAlias.Validators._validators}")
print(f"DEBUG: Number of validators: {len(OptionalAlias.Validators._validators)}\n")

# Test 1: Create an OptionalAlias with a value
print("Test 1: Creating OptionalAlias with a value")
alias_with_value = OptionalAlias.from_str("hello")
print(f"  Created: {alias_with_value}")
print(f"  Value: {alias_with_value.get_as_str()}")

# Test 2: Create an OptionalAlias with None
print("\nTest 2: Creating OptionalAlias with None")
alias_with_none = OptionalAlias.from_str(None)
print(f"  Created: {alias_with_none}")
print(f"  Value: {alias_with_none.get_as_str()}")

# Test 3: Direct instantiation
print("\nTest 3: Direct instantiation")
alias_direct = OptionalAlias(root="world")
print(f"  Created: {alias_direct}")
print(f"  Value: {alias_direct.get_as_str()}")

print("\n✅ All imports and tests successful!")
