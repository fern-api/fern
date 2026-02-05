import pytest
from pydantic import ValidationError
from seed import Acai

def test_recursive_model():
    # NOTE(tjb9dc): This should fail due to a validation error and NOT a PydanticUserError
    with pytest.raises(ValidationError):
        Acai()
