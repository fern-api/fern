from pydantic import ValidationError
from seed import Acai
import pytest

def test_model_is_defined():
    # Should raise a validation error and not a pydantic.errors.PydanticUserError
    with pytest.raises(ValidationError):
        Acai()