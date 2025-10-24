from seed.core import construct_type
from seed.types import UnionWithDiscriminant, UnionWithDiscriminant_Bar, UnionWithDiscriminant_Foo


def test_union_deserialize_with_valid_data():
    """Test deserialization with completely valid data."""
    # Valid data for UnionWithDiscriminant_Bar variant
    valid_data = {"_type": "bar", "bar": {"name": "test_name"}}
    
    result = construct_type(type_=UnionWithDiscriminant, object_=valid_data)
    
    assert isinstance(result, UnionWithDiscriminant_Bar)
    assert result.type == "bar"
    assert result.bar.name == "test_name"


def test_union_deserialize_with_invalid_data_correct_discriminator():
    """
    Test deserialization with invalid data but correct discriminator.
    
    This should return a UnionWithDiscriminant_Bar instance with a name of None (invalid data).
    """
    # Invalid data: missing required 'name' field in 'bar', but has correct '_type' discriminator
    invalid_data = {"_type": "bar", "bar": {}}
    
    result = construct_type(type_=UnionWithDiscriminant, object_=invalid_data)

    assert isinstance(result, UnionWithDiscriminant_Bar)
    assert result.type == "bar"
    # Interestingly, this gets populated with defaults
    assert result.bar.model_dump() == {"name": None}


def test_union_deserialize_with_invalid_data_wrong_discriminator():
    """
    Test deserialization with invalid data and non-matching discriminator.
    
    This should return the first member of the union, which is UnionWithDiscriminant_Foo.
    """
    # Invalid data: wrong discriminator value that doesn't match any variant
    invalid_data = {"_type": "invalid_type"}
    
    result = construct_type(type_=UnionWithDiscriminant, object_=invalid_data)

    assert isinstance(result, UnionWithDiscriminant_Foo)
    assert result.type == "invalid_type"
    assert result.foo is None
