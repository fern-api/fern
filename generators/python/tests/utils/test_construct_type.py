


from datetime import datetime, date
from typing import cast
import uuid

from core_utilities.sdk.unchecked_base_model import construct_type
from .example_models.complex_object import ObjectWithOptionalField
from .example_models.union import Shape_Circle, Shape_Square


def test_construct_valid() -> None:
    response = {
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
        "map": {"1": "string"},
        "union": {"type": "square", "id": "string", "length": 1.1},
    }
    cast_response = cast(ObjectWithOptionalField, construct_type(type_=ObjectWithOptionalField, object_=response))

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
    assert cast_response.map_ == {"1": "string"}

    shape_expectation = Shape_Square(id="string", length=1.1)
    assert cast_response.union.id == shape_expectation.id
    assert cast_response.union.length == shape_expectation.length
    assert cast_response.union.type == shape_expectation.type


def test_construct_invalid() -> None:
    response = {
        "string": 1000000,
        "integer": ["string"],
        "long": "hello world",
        "double": 1.1,
        "bool": "False",
        "datetime": "2023-01-15",
        "date": "SGVsbG8gd29ybGQh",
        "uuid": "1234",
        "base64": 123,
        "list": {"1": "string"},
        "set": "testing",
        "map": "hello world",
        "union": {"id": "123", "length": 1.1},
    }
    cast_response = cast(ObjectWithOptionalField, construct_type(type_=ObjectWithOptionalField, object_=response))

    assert cast_response.string == 1000000
    assert cast_response.integer == ["string"]
    assert cast_response.long_ == "hello world"
    assert cast_response.double == 1.1
    assert cast_response.bool_ == "False"
    assert cast_response.datetime == "2023-01-15"
    assert cast_response.date == "SGVsbG8gd29ybGQh"
    assert cast_response.uuid_ == "1234"
    assert cast_response.base_64 == 123
    assert cast_response.list_ == {"1": "string"}
    assert cast_response.set_ == "testing"
    assert cast_response.map_ == "hello world"
    
    # Note that even though the response is attempting to be a Square (note the "length" field), the
    # union is still going to create a circle given the type is not specified in the response.
    shape_expectation = Shape_Circle(id="123", radius=1.1)
    assert cast_response.union.id == shape_expectation.id
    assert cast_response.union.length == shape_expectation.radius
    assert cast_response.union.type == shape_expectation.type


def test_construct_defaults() -> None:
    response = {}
    cast_response = cast(ObjectWithOptionalField, construct_type(type_=ObjectWithOptionalField, object_=response))

    assert cast_response.string is None
    assert cast_response.integer is None
    assert cast_response.long_ == 200000
    assert cast_response.double is None
    assert cast_response.bool_ == True
    assert cast_response.datetime is None
    assert cast_response.date is None
    assert cast_response.uuid_ is None
    assert cast_response.base_64 is None
    assert cast_response.list_ is None
    assert cast_response.set_ is None
    assert cast_response.map_ is None
    assert cast_response.union is None


def test_construct_primitives() -> None:
    response = "hello world"
    cast_response = cast(str, construct_type(type_=str, object_=response))

    assert cast_response == response

    response = 1.1
    cast_response = cast(float, construct_type(type_=float, object_=response))

    assert cast_response == response

    response = "2024-01-15T09:30:00Z"
    cast_response = cast(datetime, construct_type(type_=datetime, object_=response))

    assert type(cast_response) == datetime

    response = "2023-01-15"
    cast_response = cast(date, construct_type(type_=date, object_=response))

    assert type(cast_response) == date
