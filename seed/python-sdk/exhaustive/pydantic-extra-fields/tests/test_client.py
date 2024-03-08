import pytest
try:
    import pydantic.v1 as pydantic  # type: ignore
except ImportError:
    import pydantic  # type: ignore
from src.seed.resources.types import NestedObjectWithOptionalField

# Get started with writing tests with pytest at https://docs.pytest.org
# @pytest.mark.skip(reason="Unimplemented")
def test_client() -> None:
    class MyObject(pydantic.BaseModel):
        string: typing.Optional[int] = None
        ...

    o = pydantic.parse_obj_as(MyObject, {"string": "string", "my_new_property": "custom_value"})

    print(o.my_new_property) # <--- "custom_value"
