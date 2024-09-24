import json
from .union_utils.types.resources.types.shape import Shape


# Temporary need while we don't have proper snippets for union utils, making the unit tests moot.
def test_union_utils() -> None:
    dummy = '{ "type": "circle", "radius": 1.1 }'
    circle = Shape.parse_raw(dummy)

    is_circle = circle.visit(
        circle=lambda _: True,
        square=lambda _: False
    )

    assert is_circle
    assert circle.dict() == json.loads(dummy)

def test_equality() -> None:
    dummy = '{ "type": "circle", "radius": 1.1 }'
    circle = Shape.parse_raw(dummy)
    circle2 = Shape.parse_raw(dummy)

    circle.dict(exclude_unset=False)
    assert circle == circle2
