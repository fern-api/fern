"""
Negative tests for undiscriminated unions.

These tests validate that undiscriminated unions do NOT have
Field(discriminator=...) metadata, confirming that the discriminated
union feature only applies to discriminated unions.
"""

import pytest
import typing_extensions
from typing import Union, get_args, get_origin

from seed.union.types.my_union import MyUnion


class TestUndiscriminatedUnionNoMetadata:
    """Test that undiscriminated unions do NOT have discriminator metadata."""
    
    def test_union_is_not_annotated(self):
        """Test that MyUnion is a plain Union, not Annotated."""
        origin = get_origin(MyUnion)
        
        assert origin is Union, \
            f"Expected MyUnion to be a plain Union, but got {origin}"
        
        assert origin is not typing_extensions.Annotated, \
            "Undiscriminated unions should not be wrapped with Annotated"
    
    def test_union_has_no_discriminator_metadata(self):
        """Test that MyUnion has no Field discriminator metadata."""
        args = get_args(MyUnion)
        
        assert len(args) > 0, "Union should have variants"
        
        for arg in args:
            assert not hasattr(arg, 'discriminator'), \
                f"Undiscriminated union should not have discriminator metadata, but found {arg}"
            
            arg_repr = repr(arg)
            assert 'discriminator' not in arg_repr.lower(), \
                f"Undiscriminated union should not mention discriminator, but repr is {arg_repr}"
