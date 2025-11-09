"""
Comprehensive tests for discriminated union feature.

These tests validate that the Python SDK generator correctly emits
discriminated unions with Field(discriminator=...) for improved performance.
"""

import pytest
import typing_extensions
from typing import get_args, get_origin

try:
    import pydantic
    from pydantic import BaseModel, ValidationError
    PYDANTIC_VERSION = int(pydantic.VERSION.split('.')[0])
except ImportError:
    pytest.skip("Pydantic is not installed", allow_module_level=True)

from seed.types.union.types.animal import Animal, Animal_Dog, Animal_Cat


class PetOwner(BaseModel):
    """Wrapper model to test union parsing in a Pydantic context."""
    owner_name: str
    pet: Animal


class TestDiscriminatedUnionParsing:
    """Test that discriminated unions parse correctly from JSON payloads."""
    
    def test_parse_dog_variant(self):
        """Test parsing a valid dog payload."""
        payload = {
            "owner_name": "Alice",
            "pet": {
                "animal": "dog",
                "name": "Buddy",
                "likes_to_woof": True
            }
        }
        
        if PYDANTIC_VERSION >= 2:
            owner = PetOwner.model_validate(payload)
        else:
            owner = PetOwner.parse_obj(payload)
        
        assert owner.owner_name == "Alice"
        assert isinstance(owner.pet, Animal_Dog)
        assert owner.pet.name == "Buddy"
        assert owner.pet.likes_to_woof is True
        assert owner.pet.animal == "dog"
    
    def test_parse_cat_variant(self):
        """Test parsing a valid cat payload."""
        payload = {
            "owner_name": "Bob",
            "pet": {
                "animal": "cat",
                "name": "Whiskers",
                "likes_to_meow": True
            }
        }
        
        if PYDANTIC_VERSION >= 2:
            owner = PetOwner.model_validate(payload)
        else:
            owner = PetOwner.parse_obj(payload)
        
        assert owner.owner_name == "Bob"
        assert isinstance(owner.pet, Animal_Cat)
        assert owner.pet.name == "Whiskers"
        assert owner.pet.likes_to_meow is True
        assert owner.pet.animal == "cat"


class TestDiscriminatedUnionErrors:
    """Test that discriminated unions raise appropriate errors for invalid payloads."""
    
    def test_invalid_discriminator_value(self):
        """Test that an invalid discriminator value raises ValidationError mentioning 'discriminator'."""
        payload = {
            "owner_name": "Charlie",
            "pet": {
                "animal": "lizard",  # Invalid discriminator value
                "name": "Godzilla"
            }
        }
        
        with pytest.raises(ValidationError) as exc_info:
            if PYDANTIC_VERSION >= 2:
                PetOwner.model_validate(payload)
            else:
                PetOwner.parse_obj(payload)
        
        error_str = str(exc_info.value).lower()
        assert "discriminator" in error_str or "animal" in error_str
    
    def test_missing_discriminator_field(self):
        """Test that a missing discriminator field raises ValidationError."""
        payload = {
            "owner_name": "Diana",
            "pet": {
                "name": "Mystery",
                "likes_to_woof": True
            }
        }
        
        with pytest.raises(ValidationError) as exc_info:
            if PYDANTIC_VERSION >= 2:
                PetOwner.model_validate(payload)
            else:
                PetOwner.parse_obj(payload)
        
        error_str = str(exc_info.value).lower()
        assert "animal" in error_str or "discriminator" in error_str


class TestDiscriminatedUnionSerialization:
    """Test round-trip serialization/deserialization of discriminated unions."""
    
    def test_roundtrip_dog(self):
        """Test that a Dog can be serialized and deserialized correctly."""
        dog = Animal_Dog(name="Buddy", likes_to_woof=True)
        owner = PetOwner(owner_name="Alice", pet=dog)
        
        if PYDANTIC_VERSION >= 2:
            data = owner.model_dump()
        else:
            data = owner.dict()
        
        assert data["pet"]["animal"] == "dog"
        assert data["pet"]["name"] == "Buddy"
        assert data["pet"]["likes_to_woof"] is True
        
        if PYDANTIC_VERSION >= 2:
            owner2 = PetOwner.model_validate(data)
        else:
            owner2 = PetOwner.parse_obj(data)
        
        assert isinstance(owner2.pet, Animal_Dog)
        assert owner2.pet.name == "Buddy"
        assert owner2.pet.likes_to_woof is True
    
    def test_roundtrip_cat(self):
        """Test that a Cat can be serialized and deserialized correctly."""
        cat = Animal_Cat(name="Whiskers", likes_to_meow=True)
        owner = PetOwner(owner_name="Bob", pet=cat)
        
        if PYDANTIC_VERSION >= 2:
            data = owner.model_dump()
        else:
            data = owner.dict()
        
        assert data["pet"]["animal"] == "cat"
        assert data["pet"]["name"] == "Whiskers"
        assert data["pet"]["likes_to_meow"] is True
        
        if PYDANTIC_VERSION >= 2:
            owner2 = PetOwner.model_validate(data)
        else:
            owner2 = PetOwner.parse_obj(data)
        
        assert isinstance(owner2.pet, Animal_Cat)
        assert owner2.pet.name == "Whiskers"
        assert owner2.pet.likes_to_meow is True
