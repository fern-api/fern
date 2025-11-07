import pytest
from pydantic import ValidationError
from seed import Acai

def test_construction():
    with pytest.raises(ValidationError):
        Acai()
