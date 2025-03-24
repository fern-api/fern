import pytest
from typing import TypeVar
from seed.core.jsonable_encoder import jsonable_encoder
from seed.core.pydantic_utilities import parse_obj_as
from pydantic import BaseModel

T = TypeVar('T', bound=BaseModel)

def assert_json_serialization(value: T) -> T:
    """
    Assert that a Pydantic model instance can be serialized to JSON and back.
    
    Args:
        instance: The model instance to [de]serialize.
    
    Raises:
        pytest.fail: If serialization or deserialization fails
    """
    model_type = type(value)
    type_name = model_type.__name__

    try:
        serialized = jsonable_encoder(value)
    except Exception as e:
        pytest.fail(f"Failed to serialize {type_name} to JSON: {e}")

    try:
        deserialized = parse_obj_as(model_type, serialized)
    except Exception as e:
        pytest.fail(f"Failed to deserialize {type_name} from JSON: {e}")

    assert value == deserialized, (
        f"JSON round-trip failed for {type_name}.\n"
        f"\tOriginal: {value}\n"
        f"\tDeserialized: {deserialized}"
    )

    # Return the deserialized instance for additional assertions if needed.
    return deserialized
