
# Get started with writing tests with pytest at https://docs.pytest.org
# @pytest.mark.skip(reason="Unimplemented")
from seed.types.object.types.nested_object_with_optional_field import NestedObjectWithOptionalField


try:
    import pydantic.v1 as pydantic  # type: ignore
except ImportError:
    import pydantic  # type: ignore

def test_client() -> None:
    print(pydantic.parse_obj_as(NestedObjectWithOptionalField, {"Type": "string22"}).__dict__)
