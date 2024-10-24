from typing import List, Any

from .unaliased_models.types.core.pydantic_utilities import parse_obj_as

from .unaliased_models.types import ObjectWithOptionalField, Shape_Circle


UNION_TEST = {"radius_measurement": 1.0, "shape_type": "circle", "id": "1"}
UNION_TEST_CONVERTED = {
    "shapeType": "circle",
    "radiusMeasurement": 1.0,
    "id": "1"
}

def test_convert_and_respect_annotation_metadata() -> None:
    wire_data = {"string": "string", "long": 12345, "bool": True, "literal": "lit_one", "any": "any"}
    converted = parse_obj_as(ObjectWithOptionalField, wire_data)
    assert converted == ObjectWithOptionalField(
        string="string",
        long_=12345,
        bool_=True,
        literal="lit_one",
        any="any"
    )

def test_convert_and_respect_annotation_metadata_in_list() -> None:
    wire_data= [
        {"string": "string", "long": 12345, "bool": True, "literal": "lit_one", "any": "any"},
        {"string": "another string", "long": 67890, "list": [], "literal": "lit_one", "any": "any"}
    ]

    converted = parse_obj_as(List[ObjectWithOptionalField], wire_data)

    assert converted == [ObjectWithOptionalField(
        string="string",
        long_=12345,
        bool_=True,
        literal="lit_one",
        any="any"
    ), ObjectWithOptionalField(
        string="another string",
        long_=67890,
        list_=[],
        literal="lit_one",
        any="any"
    )]


def test_convert_and_respect_annotation_metadata_in_nested_object() -> None:
    wire_data = {
        "string": "string",
        "long": 12345,
        "union": UNION_TEST_CONVERTED,
        "literal": "lit_one",
        "any": "any"
    }

    converted = parse_obj_as(ObjectWithOptionalField, wire_data)

    assert converted ==  ObjectWithOptionalField(
        string="string",
        long_=12345,
        union=Shape_Circle(
            radius_measurement=1.0,
            id="1"
        ),
        literal="lit_one",
        any="any"
    )
