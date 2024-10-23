


from datetime import datetime, date
from typing import cast
import uuid

from .example_models.types.core.unchecked_base_model import construct_type
from tests.utils.example_models.types.resources.types.square import Square
from .example_models.manual_types.defaulted_object import ObjectWithDefaultedOptionalFields
from .example_models.types.resources.types import ObjectWithOptionalField, Circle, Shape_Square, Shape_Circle


def test_construct_valid() -> None:
    response = {
        "literal": "lit_one",
        "string": "circle",
        "integer": 1,
        "long": 1000000,
        "double": 1.1,
        "bool": False,
        "datetime": "2024-01-15T09:30:00Z",
        "date": "2023-01-15",
        "uuid": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        "base64": "SGVsbG8gd29ybGQh",
        "list": ["string"],
        "set": ["string"],
        "map": {1: "string"},
        "union": {"type": "square", "id": "string", "length": 1.1},
        "second_union": {"type": "circle", "id": "another_string", "radius": 2.3},
        "undiscriminated_union": {"id": "string2", "length": 6.7},
        "enum": "red",
        "any": "something here",
        "additional_field": "this here"
    }
    cast_response = cast(ObjectWithOptionalField, construct_type(type_=ObjectWithOptionalField, object_=response))

    assert cast_response.literal == "lit_one"
    assert cast_response.string == "circle"
    assert cast_response.integer == 1
    assert cast_response.long_ == 1000000
    assert cast_response.double == 1.1
    assert cast_response.bool_ == False
    assert cast_response.datetime == datetime.fromisoformat("2024-01-15 09:30:00+00:00")
    assert cast_response.date == date.fromisoformat("2023-01-15")
    assert cast_response.uuid_ == uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")
    assert cast_response.base_64 == "SGVsbG8gd29ybGQh"
    assert cast_response.list_ == ["string"]
    assert cast_response.set_ == {"string"}
    assert cast_response.map_ == {1: "string"}
    assert cast_response.enum == "red"
    assert cast_response.any == "something here"
    assert cast_response.additional_field == "this here"  # type: ignore # Since this is not in the model mypy complains, but it's still fine

    square_expectation = Shape_Square(id="string", length=1.1)
    assert cast_response.union is not None
    assert cast_response.union.id == square_expectation.id
    assert isinstance(cast_response.union, Shape_Square) and cast_response.union.length == square_expectation.length
    assert cast_response.union.type == square_expectation.type

    circle_expectation = Shape_Circle(id="another_string", radius=2.3)
    assert cast_response.second_union is not None
    assert cast_response.second_union.id == circle_expectation.id
    assert isinstance(cast_response.second_union, Shape_Circle) and cast_response.second_union.radius == circle_expectation.radius
    assert cast_response.second_union.type == circle_expectation.type

    assert cast_response.undiscriminated_union is not None
    assert cast_response.undiscriminated_union.id == "string2"  # type: ignore # Since this is not in the model mypy complains, but it's still fine
    assert isinstance(cast_response.undiscriminated_union, Square) and cast_response.undiscriminated_union.length == 6.7


# def test_construct_unset() -> None:
#     response = {
#         "literal": "lit_one",
#         "string": "circle",
#         "integer": 1,
#         "long": 1000000,
#         "double": 1.1,
#         "bool": False,
#         "datetime": "2024-01-15T09:30:00Z",
#         "date": "2023-01-15",
#         "uuid": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
#         "base64": "SGVsbG8gd29ybGQh",
#         "list": ["string"],
#         "set": ["string"],
#         "map": {1: "string"},
#         "union": {"type": "square", "id": "string", "length": 1.1},
#         "undiscriminated_union": {"id": "string2", "length": 6.7},
#         "enum": "red",
#         "any": "something here"
#     }
#     cast_response = cast(ObjectWithOptionalField, construct_type(type_=ObjectWithOptionalField, object_=response))

#     d = cast_response.dict(by_alias=True, exclude_unset=True)
#     assert d == {
#         "literal": "lit_one",
#         "string": "circle",
#         "integer": 1,
#         "long": 1000000,
#         "double": 1.1,
#         "bool": False,
#         "datetime": datetime.fromisoformat("2024-01-15 09:30:00+00:00"),
#         "date": date.fromisoformat("2023-01-15"),
#         "uuid": uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
#         "base64": "SGVsbG8gd29ybGQh",
#         "list": ["string"],
#         "set": {"string"},
#         "map": {1: "string"},
#         "union": {"type": "square", "id": "string", "length": 1.1},
#         "undiscriminated_union": {"id": "string2", "length": 6.7},
#         "enum": "red",
#         "any": "something here"
#     }

# def test_construct_invalid() -> None:
#     response = {
#         "literal": "something_else",
#         "string": 1000000,
#         "integer": ["string"],
#         "long": "hello world",
#         "double": 1.1,
#         "bool": "False",
#         "datetime": "2023-01-15",
#         "date": "SGVsbG8gd29ybGQh",
#         "uuid": "1234",
#         "base64": 123,
#         "list": {1: "string"},
#         "set": "testing",
#         "map": "hello world",
#         "union": {"id": "123", "length": 1.1},
#         "undiscriminated_union": {"id": "123", "length": "fifteen"},
#         "enum": "bread"
#     }
#     cast_response = cast(ObjectWithOptionalField, construct_type(type_=ObjectWithOptionalField, object_=response))

#     assert cast_response.literal == "something_else"
#     assert cast_response.string == 1000000
#     assert cast_response.integer == ["string"]
#     assert cast_response.long_ == "hello world"
#     assert cast_response.double == 1.1
#     assert cast_response.bool_ == False
#     assert cast_response.datetime == "2023-01-15"
#     assert cast_response.date == "SGVsbG8gd29ybGQh"
#     assert cast_response.uuid_ == "1234"
#     assert cast_response.base_64 == 123
#     assert cast_response.list_ == {1: "string"}
#     assert cast_response.set_ == "testing"
#     assert cast_response.map_ == "hello world"
#     assert cast_response.enum == "bread"
#     assert cast_response.any is None
    
#     shape_expectation = Shape_Square(id="123", length=1.1)
#     assert cast_response.union is not None
#     assert cast_response.union.id == shape_expectation.id
#     assert cast_response.union.length == shape_expectation.length
#     assert cast_response.union.type == shape_expectation.type

#     # Note that even though the response is attempting to be a Square (note the "length" field), the
#     # union is still going to create a circle given the type is not specified in the response.
#     assert cast_response.undiscriminated_union is not None
#     assert type(cast_response.undiscriminated_union) == Circle


# def test_construct_defaults() -> None:
#     response: object = {}
#     cast_response = cast(ObjectWithDefaultedOptionalFields, construct_type(type_=ObjectWithDefaultedOptionalFields, object_=response))

#     assert cast_response.string is None
#     assert cast_response.integer is None
#     assert cast_response.long_ == 200000
#     assert cast_response.double is None
#     assert cast_response.bool_ == True
#     assert cast_response.datetime is None
#     assert cast_response.date is None


# def test_construct_defaults_unset() -> None:
#     response: object = {}
#     cast_response = cast(ObjectWithDefaultedOptionalFields, construct_type(type_=ObjectWithDefaultedOptionalFields, object_=response))

#     d = cast_response.dict(by_alias=True, exclude_unset=True)
#     assert d == {'bool': True, 'literal': 'lit_one', 'long': 200000}


# def test_construct_primitives() -> None:
#     response_str = "hello world"
#     cast_response_str = cast(str, construct_type(type_=str, object_=response_str))

#     assert cast_response_str == response_str

#     response_float = 1.1
#     cast_response_float = cast(float, construct_type(type_=float, object_=response_float))

#     assert cast_response_float == response_float

#     response_datetime = "2024-01-15T09:30:00Z"
#     cast_response_datetime = cast(datetime, construct_type(type_=datetime, object_=response_datetime))

#     assert type(cast_response_datetime) == datetime

#     response_date = "2023-01-15"
#     cast_response_date = cast(date, construct_type(type_=date, object_=response_date))

#     assert type(cast_response_date) == date
