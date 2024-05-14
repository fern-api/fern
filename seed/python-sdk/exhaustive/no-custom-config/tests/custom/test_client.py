import pytest

from seed.types.object.types.object_with_optional_field import ObjectWithOptionalField

# Get started with writing tests with pytest at https://docs.pytest.org
# @pytest.mark.skip(reason="Unimplemented")
def test_client() -> None:
    o = ObjectWithOptionalField(
        string="string",
        double=1.0,
        set_integer=None
    )

    print(o.dict())
