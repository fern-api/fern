
# Get started with writing tests with pytest at https://docs.pytest.org
# @pytest.mark.skip(reason="Unimplemented")
from seed.resources.types.resources.object.types.nested_object_with_optional_field import NestedObjectWithOptionalField
try:
    import pydantic.v1 as pydantic  # type: ignore
except ImportError:
    import pydantic  # type: ignore

def test_client() -> None:
    pydantic.parse_obj_as(NestedObjectWithOptionalField, {"string": "string"})
