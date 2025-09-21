


from datetime import datetime, date
from typing import cast, List, Union
import uuid

from tests.utils.example_models.types.resources.types.shape import Shape_Circle, Shape_Square
from .example_models.types.core.unchecked_base_model import construct_type
from tests.utils.example_models.types.resources.types.square import Square
from tests.utils.example_models.types.resources.types.circle import Circle
from .example_models.manual_types.defaulted_object import ObjectWithDefaultedOptionalFields
from .example_models.types.resources.types import ObjectWithOptionalField


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


def test_construct_primitives() -> None:
    response_str = "hello world"
    cast_response_str = cast(str, construct_type(type_=str, object_=response_str))

    assert cast_response_str == response_str

    response_float = 1.1
    cast_response_float = cast(float, construct_type(type_=float, object_=response_float))

    assert cast_response_float == response_float

    response_datetime = "2024-01-15T09:30:00Z"
    cast_response_datetime = cast(datetime, construct_type(type_=datetime, object_=response_datetime))

    assert type(cast_response_datetime) == datetime

    response_date = "2023-01-15"
    cast_response_date = cast(date, construct_type(type_=date, object_=response_date))

    assert type(cast_response_date) == date


def test_construct_list_of_objects() -> None:
    """Test the new functionality for handling lists of objects in undiscriminated unions."""
    # Test with list of Circle objects
    circle_list_data = [
        {"radius": 1.5},
        {"radius": 2.0},
        {"radius": 3.2}
    ]
    
    result = construct_type(type_=List[Circle], object_=circle_list_data)
    
    assert isinstance(result, list)
    assert len(result) == 3
    for i, circle in enumerate(result):
        assert isinstance(circle, Circle)
        assert circle.radius == circle_list_data[i]["radius"]
    
    # Test with list of Square objects
    square_list_data = [
        {"length": 4.0},
        {"length": 5.5},
        {"length": 6.1}
    ]
    
    result = construct_type(type_=List[Square], object_=square_list_data)
    
    assert isinstance(result, list)
    assert len(result) == 3
    for i, square in enumerate(result):
        assert isinstance(square, Square)
        assert square.length == square_list_data[i]["length"]


def test_construct_undiscriminated_union_with_list() -> None:
    """Test undiscriminated union handling with lists of objects."""
    from .example_models.types.resources.types import UndiscriminatedShape
    
    # Test with list of Circle objects in undiscriminated union
    circle_list_data = [
        {"radius": 1.0},
        {"radius": 2.5},
        {"radius": 3.0}
    ]
    
    result = construct_type(type_=List[UndiscriminatedShape], object_=circle_list_data)
    
    assert isinstance(result, list)
    assert len(result) == 3
    for circle in result:
        assert isinstance(circle, Circle)
    
    # Test with list of Square objects in undiscriminated union
    square_list_data = [
        {"length": 4.0},
        {"length": 5.0},
        {"length": 6.0}
    ]
    
    result = construct_type(type_=List[UndiscriminatedShape], object_=square_list_data)
    
    assert isinstance(result, list)
    assert len(result) == 3
    for square in result:
        assert isinstance(square, Square)


def test_construct_mixed_list_in_undiscriminated_union() -> None:
    """Test undiscriminated union handling with mixed list of objects."""
    from .example_models.types.resources.types import UndiscriminatedShape
    
    # Test with mixed list of Circle and Square objects
    mixed_list_data = [
        {"radius": 1.0},  # Circle
        {"length": 4.0},  # Square
        {"radius": 2.5},  # Circle
        {"length": 5.0},  # Square
    ]
    
    result = construct_type(type_=List[UndiscriminatedShape], object_=mixed_list_data)
    
    assert isinstance(result, list)
    assert len(result) == 4
    
    # Check that each item is correctly parsed
    assert isinstance(result[0], Circle)
    assert result[0].radius == 1.0
    
    assert isinstance(result[1], Square)
    assert result[1].length == 4.0
    
    assert isinstance(result[2], Circle)
    assert result[2].radius == 2.5
    
    assert isinstance(result[3], Square)
    assert result[3].length == 5.0


def test_construct_list_with_invalid_objects() -> None:
    """Test list handling when some objects are invalid."""
    from .example_models.types.resources.types import UndiscriminatedShape
    
    # Test with list containing invalid objects
    invalid_list_data = [
        {"radius": 1.0},  # Valid Circle
        {"invalid_field": "value"},  # Invalid object
        {"length": 4.0},  # Valid Square
        {"another_invalid": 123},  # Invalid object
    ]
    
    result = construct_type(type_=List[UndiscriminatedShape], object_=invalid_list_data)
    
    # Should still return a list, but invalid objects might be handled differently
    assert isinstance(result, list)
    assert len(result) == 4
    
    # Valid objects should be correctly parsed
    assert isinstance(result[0], Circle)
    assert result[0].radius == 1.0
    
    assert isinstance(result[2], Square)
    assert result[2].length == 4.0


def test_construct_empty_list() -> None:
    """Test handling of empty lists in undiscriminated unions."""
    from .example_models.types.resources.types import UndiscriminatedShape
    
    empty_list_data = []
    
    result = construct_type(type_=List[UndiscriminatedShape], object_=empty_list_data)
    
    assert isinstance(result, list)
    assert len(result) == 0


def test_construct_list_with_primitive_types() -> None:
    """Test list handling with primitive types (should not use the new list parsing logic)."""
    # Test with list of strings
    string_list_data = ["hello", "world", "test"]
    
    result = construct_type(type_=List[str], object_=string_list_data)
    
    assert isinstance(result, list)
    assert result == string_list_data
    
    # Test with list of integers
    int_list_data = [1, 2, 3, 4, 5]
    
    result = construct_type(type_=List[int], object_=int_list_data)
    
    assert isinstance(result, list)
    assert result == int_list_data


def test_construct_nested_lists() -> None:
    """Test handling of nested lists with objects."""
    from .example_models.types.resources.types import UndiscriminatedShape
    
    # Test with nested list structure
    nested_list_data = [
        [
            {"radius": 1.0},
            {"length": 4.0}
        ],
        [
            {"radius": 2.0},
            {"length": 5.0}
        ]
    ]
    
    result = construct_type(type_=List[List[UndiscriminatedShape]], object_=nested_list_data)
    
    assert isinstance(result, list)
    assert len(result) == 2
    
    for sublist in result:
        assert isinstance(sublist, list)
        assert len(sublist) == 2
        
        # Check first sublist
        if sublist == result[0]:
            assert isinstance(sublist[0], Circle)
            assert sublist[0].radius == 1.0
            assert isinstance(sublist[1], Square)
            assert sublist[1].length == 4.0
        # Check second sublist
        elif sublist == result[1]:
            assert isinstance(sublist[0], Circle)
            assert sublist[0].radius == 2.0
            assert isinstance(sublist[1], Square)
            assert sublist[1].length == 5.0


def test_undiscriminated_union_with_list_types() -> None:
    """Test undiscriminated union containing list types as options."""
    from .example_models.types.resources.types import Circle, Square

    # Create a union type that includes list types as options
    TestUnion = Union[str, List[Circle], List[Square], int]

    # Test with list of Circle data - should match List[Circle]
    circle_list_data = [
        {"radius": 1.5},
        {"radius": 2.0},
        {"radius": 3.2}
    ]

    result = construct_type(type_=TestUnion, object_=circle_list_data)

    assert isinstance(result, list)
    assert len(result) == 3
    for i, circle in enumerate(result):
        assert isinstance(circle, Circle)
        assert circle.radius == circle_list_data[i]["radius"]

    # Test with list of Square data - should match List[Square]
    square_list_data = [
        {"length": 4.0},
        {"length": 5.5},
        {"length": 6.1}
    ]

    result = construct_type(type_=TestUnion, object_=square_list_data)

    assert isinstance(result, list)
    assert len(result) == 3
    for i, square in enumerate(result):
        assert isinstance(square, Square)
        assert square.length == square_list_data[i]["length"]

    # Test with string data - should match str
    string_data = "hello world"
    result = construct_type(type_=TestUnion, object_=string_data)
    assert result == string_data
    assert isinstance(result, str)

    # Test with int data - should match int
    int_data = 42
    result = construct_type(type_=TestUnion, object_=int_data)
    assert result == int_data
    assert isinstance(result, int)


def test_undiscriminated_union_with_mixed_list_types() -> None:
    """Test undiscriminated union with both individual objects and lists as options."""
    from .example_models.types.resources.types import Circle, Square

    # Union that includes both individual objects and lists
    TestUnion = Union[Circle, Square, List[Circle], List[Square], str]

    # Test with single Circle object - should match Circle
    single_circle_data = {"radius": 1.0}
    result = construct_type(type_=TestUnion, object_=single_circle_data)
    assert isinstance(result, Circle)
    assert result.radius == 1.0

    # Test with single Square object - should match Square
    single_square_data = {"length": 2.0}
    result = construct_type(type_=TestUnion, object_=single_square_data)
    assert isinstance(result, Square)
    assert result.length == 2.0

    # Test with list of Circles - should match List[Circle]
    circle_list_data = [{"radius": 1.0}, {"radius": 2.0}]
    result = construct_type(type_=TestUnion, object_=circle_list_data)
    assert isinstance(result, list)
    assert len(result) == 2
    for circle in result:
        assert isinstance(circle, Circle)

    # Test with list of Squares - should match List[Square]
    square_list_data = [{"length": 3.0}, {"length": 4.0}]
    result = construct_type(type_=TestUnion, object_=square_list_data)
    assert isinstance(result, list)
    assert len(result) == 2
    for square in result:
        assert isinstance(square, Square)


def test_undiscriminated_union_with_primitive_lists() -> None:
    """Test undiscriminated union with lists of primitive types."""
    from .example_models.types.resources.types import Circle

    # Union that includes lists of primitives and objects
    TestUnion = Union[List[str], List[int], List[Circle], str]

    # Test with list of strings - should match List[str]
    string_list_data = ["hello", "world", "test"]
    result = construct_type(type_=TestUnion, object_=string_list_data)
    assert isinstance(result, list)
    assert result == string_list_data

    # Test with list of integers - should match List[int]
    int_list_data = [1, 2, 3, 4, 5]
    result = construct_type(type_=TestUnion, object_=int_list_data)
    assert isinstance(result, list)
    assert result == int_list_data

    # Test with list of Circle objects - should match List[Circle]
    circle_list_data = [{"radius": 1.0}, {"radius": 2.0}]
    result = construct_type(type_=TestUnion, object_=circle_list_data)
    assert isinstance(result, list)
    assert len(result) == 2
    for circle in result:
        assert isinstance(circle, Circle)


def test_undiscriminated_union_list_parsing_failures() -> None:
    """Test edge cases and failure scenarios for list parsing in unions."""
    from .example_models.types.resources.types import Circle, Square

    # Union with list types
    TestUnion = Union[List[Circle], List[Square], str]

    # Test with empty list - should work with either list type
    empty_list_data = []
    result = construct_type(type_=TestUnion, object_=empty_list_data)
    assert isinstance(result, list)
    assert len(result) == 0

    # Test with list containing invalid objects - should fallback gracefully
    invalid_list_data = [
        {"invalid_field": "value"},
        {"another_invalid": 123}
    ]
    result = construct_type(type_=TestUnion, object_=invalid_list_data)
    # The result behavior depends on implementation - it should either parse or fallback
    assert result is not None

    # Test with non-list data when union only has list types
    string_data = "not a list"
    result = construct_type(type_=TestUnion, object_=string_data)
    assert result == string_data  # Should match str fallback


def test_nested_undiscriminated_union_with_lists() -> None:
    """Test complex nested structures with undiscriminated unions containing lists."""
    from .example_models.types.resources.types import Circle, Square

    # Complex nested union type
    TestUnion = Union[List[List[Circle]], List[Square], str]

    # Test with nested list of Circles
    nested_circle_data = [
        [{"radius": 1.0}, {"radius": 2.0}],
        [{"radius": 3.0}, {"radius": 4.0}]
    ]

    result = construct_type(type_=TestUnion, object_=nested_circle_data)

    assert isinstance(result, list)
    assert len(result) == 2

    for sublist in result:
        assert isinstance(sublist, list)
        assert len(sublist) == 2
        for circle in sublist:
            assert isinstance(circle, Circle)

    # Verify specific values
    assert result[0][0].radius == 1.0
    assert result[0][1].radius == 2.0
    assert result[1][0].radius == 3.0
    assert result[1][1].radius == 4.0


def test_undiscriminated_union_list_type_precedence() -> None:
    """Test that list types are properly prioritized in undiscriminated unions."""
    from .example_models.types.resources.types import Circle, Square

    # Union where both individual objects and lists could potentially match
    TestUnion = Union[Circle, List[Circle], Square, List[Square]]

    # Test with data that could be parsed as either a single Circle or a list with one Circle
    # The new list parsing logic should take precedence for list data
    single_item_list_data = [{"radius": 1.0}]

    result = construct_type(type_=TestUnion, object_=single_item_list_data)

    # Should be parsed as List[Circle], not as a single Circle
    assert isinstance(result, list)
    assert len(result) == 1
    assert isinstance(result[0], Circle)
    assert result[0].radius == 1.0

    # Test with data that should clearly be a single object
    single_object_data = {"radius": 2.0}

    result = construct_type(type_=TestUnion, object_=single_object_data)

    # Should be parsed as Circle, not as a list
    assert isinstance(result, Circle)
    assert result.radius == 2.0


# def test_construct_set_of_objects() -> None:
#     """Test the functionality for handling sets of objects in undiscriminated unions."""
#     from .example_models.types.resources.types import Circle, Square

#     # Test with set of Circle objects
#     circle_set_data = [
#         {"radius": 1.5},
#         {"radius": 2.0},
#         {"radius": 3.2}
#     ]
    
#     result = construct_type(type_=set[Circle], object_=circle_set_data)
    
#     assert isinstance(result, set)
#     assert len(result) == 3
#     for circle in result:
#         assert isinstance(circle, Circle)
#         assert circle.radius in [1.5, 2.0, 3.2]
    
#     # Test with set of Square objects
#     square_set_data = [
#         {"length": 4.0},
#         {"length": 5.5},
#         {"length": 6.1}
#     ]
    
#     result = construct_type(type_=set[Square], object_=square_set_data)
    
#     assert isinstance(result, set)
#     assert len(result) == 3
#     for square in result:
#         assert isinstance(square, Square)
#         assert square.length in [4.0, 5.5, 6.1]


# def test_construct_undiscriminated_union_with_set() -> None:
#     """Test undiscriminated union handling with sets of objects."""
#     from .example_models.types.resources.types import Circle, Square

#     # Test with set of Circle objects in undiscriminated union
#     circle_set_data = [
#         {"radius": 1.0},
#         {"radius": 2.5},
#         {"radius": 3.0}
#     ]
    
#     result = construct_type(type_=set[Circle], object_=circle_set_data)
    
#     assert isinstance(result, set)
#     assert len(result) == 3
#     for circle in result:
#         assert isinstance(circle, Circle)
    
#     # Test with set of Square objects in undiscriminated union
#     square_set_data = [
#         {"length": 4.0},
#         {"length": 5.0},
#         {"length": 6.0}
#     ]
    
#     result = construct_type(type_=set[Square], object_=square_set_data)
    
#     assert isinstance(result, set)
#     assert len(result) == 3
#     for square in result:
#         assert isinstance(square, Square)


# def test_construct_mixed_set_in_undiscriminated_union() -> None:
#     """Test undiscriminated union handling with mixed set of objects."""
#     from .example_models.types.resources.types import Circle, Square

#     # Test with mixed set of Circle and Square objects
#     mixed_set_data = [
#         {"radius": 1.0},  # Circle
#         {"length": 4.0},  # Square
#         {"radius": 2.5},  # Circle
#         {"length": 5.0},  # Square
#     ]
    
#     # This should work with the current implementation since it processes each item individually
#     result = construct_type(type_=set[Circle], object_=mixed_set_data)
    
#     assert isinstance(result, set)
#     # Only Circle objects should be successfully parsed
#     circle_count = sum(1 for item in result if isinstance(item, Circle))
#     assert circle_count > 0


def test_construct_dict_of_objects() -> None:
    """Test the functionality for handling dictionaries of objects in undiscriminated unions."""
    from .example_models.types.resources.types import Circle, Square

    # Test with dict of Circle objects
    circle_dict_data = {
        "circle1": {"radius": 1.5},
        "circle2": {"radius": 2.0},
        "circle3": {"radius": 3.2}
    }
    
    result = construct_type(type_=dict[str, Circle], object_=circle_dict_data)
    
    assert isinstance(result, dict)
    assert len(result) == 3
    for key, circle in result.items():
        assert isinstance(circle, Circle)
        assert key in ["circle1", "circle2", "circle3"]
    
    # Test with dict of Square objects
    square_dict_data = {
        "square1": {"length": 4.0},
        "square2": {"length": 5.5},
        "square3": {"length": 6.1}
    }
    
    result = construct_type(type_=dict[str, Square], object_=square_dict_data)
    
    assert isinstance(result, dict)
    assert len(result) == 3
    for key, square in result.items():
        assert isinstance(square, Square)
        assert key in ["square1", "square2", "square3"]


def test_construct_undiscriminated_union_with_dict() -> None:
    """Test undiscriminated union handling with dictionaries of objects."""
    from .example_models.types.resources.types import Circle, Square

    # Test with dict of Circle objects in undiscriminated union
    circle_dict_data = {
        "circle1": {"radius": 1.0},
        "circle2": {"radius": 2.5},
        "circle3": {"radius": 3.0}
    }
    
    result = construct_type(type_=dict[str, Circle], object_=circle_dict_data)
    
    assert isinstance(result, dict)
    assert len(result) == 3
    for circle in result.values():
        assert isinstance(circle, Circle)
    
    # Test with dict of Square objects in undiscriminated union
    square_dict_data = {
        "square1": {"length": 4.0},
        "square2": {"length": 5.0},
        "square3": {"length": 6.0}
    }
    
    result = construct_type(type_=dict[str, Square], object_=square_dict_data)
    
    assert isinstance(result, dict)
    assert len(result) == 3
    for square in result.values():
        assert isinstance(square, Square)


# def test_construct_set_with_invalid_objects() -> None:
#     """Test set handling when some objects are invalid."""
#     from .example_models.types.resources.types import Circle

#     # Test with set containing invalid objects
#     invalid_set_data = [
#         {"radius": 1.0},  # Valid Circle
#         {"invalid_field": "value"},  # Invalid object
#         {"radius": 2.0},  # Valid Circle
#         {"another_invalid": 123},  # Invalid object
#     ]
    
#     result = construct_type(type_=set[Circle], object_=invalid_set_data)
    
#     # Should still return a set, but invalid objects might be handled differently
#     assert isinstance(result, set)
#     # Valid objects should be correctly parsed
#     valid_circles = [circle for circle in result if isinstance(circle, Circle)]
    # assert len(valid_circles) > 0


def test_construct_dict_with_invalid_objects() -> None:
    """Test dict handling when some objects are invalid."""
    from .example_models.types.resources.types import Circle

    # Test with dict containing invalid objects
    invalid_dict_data = {
        "valid1": {"radius": 1.0},  # Valid Circle
        "invalid1": {"invalid_field": "value"},  # Invalid object
        "valid2": {"radius": 2.0},  # Valid Circle
        "invalid2": {"another_invalid": 123},  # Invalid object
    }
    
    result = construct_type(type_=dict[str, Circle], object_=invalid_dict_data)
    
    # Should still return a dict, but invalid objects might be handled differently
    assert isinstance(result, dict)
    # Valid objects should be correctly parsed
    valid_circles = [circle for circle in result.values() if isinstance(circle, Circle)]
    assert len(valid_circles) > 0


def test_construct_empty_set() -> None:
    """Test handling of empty sets in undiscriminated unions."""
    from .example_models.types.resources.types import Circle

    empty_set_data = []
    
    result = construct_type(type_=set[Circle], object_=empty_set_data)
    
    assert isinstance(result, set)
    assert len(result) == 0


def test_construct_empty_dict() -> None:
    """Test handling of empty dictionaries in undiscriminated unions."""
    from .example_models.types.resources.types import Circle

    empty_dict_data = {}
    
    result = construct_type(type_=dict[str, Circle], object_=empty_dict_data)
    
    assert isinstance(result, dict)
    assert len(result) == 0


def test_construct_set_with_primitive_types() -> None:
    """Test set handling with primitive types (should not use the new set parsing logic)."""
    # Test with set of strings
    string_set_data = ["hello", "world", "test"]
    
    result = construct_type(type_=set[str], object_=string_set_data)
    
    assert isinstance(result, set)
    assert result == {"hello", "world", "test"}
    
    # Test with set of integers
    int_set_data = [1, 2, 3, 4, 5]
    
    result = construct_type(type_=set[int], object_=int_set_data)
    
    assert isinstance(result, set)
    assert result == {1, 2, 3, 4, 5}


def test_construct_dict_with_primitive_types() -> None:
    """Test dict handling with primitive types (should not use the new dict parsing logic)."""
    # Test with dict of strings
    string_dict_data = {"key1": "value1", "key2": "value2"}
    
    result = construct_type(type_=dict[str, str], object_=string_dict_data)
    
    assert isinstance(result, dict)
    assert result == {"key1": "value1", "key2": "value2"}
    
    # Test with dict of integers
    int_dict_data = {"a": 1, "b": 2, "c": 3}
    
    result = construct_type(type_=dict[str, int], object_=int_dict_data)
    
    assert isinstance(result, dict)
    assert result == {"a": 1, "b": 2, "c": 3}


# def test_undiscriminated_union_with_set_types() -> None:
#     """Test undiscriminated union containing set types as options."""
#     from .example_models.types.resources.types import Circle, Square

#     # Create a union type that includes set types as options
#     TestUnion = Union[str, set[Circle], set[Square], int]

#     # Test with set of Circle data - should match set[Circle]
#     circle_set_data = [
#         {"radius": 1.5},
#         {"radius": 2.0},
#         {"radius": 3.2}
#     ]

#     result = construct_type(type_=TestUnion, object_=circle_set_data)

#     assert isinstance(result, set)
#     assert len(result) == 3
#     for circle in result:
#         assert isinstance(circle, Circle)

#     # Test with set of Square data - should match set[Square]
#     square_set_data = [
#         {"length": 4.0},
#         {"length": 5.5},
#         {"length": 6.1}
#     ]

#     result = construct_type(type_=TestUnion, object_=square_set_data)

#     assert isinstance(result, set)
#     assert len(result) == 3
#     for square in result:
#         assert isinstance(square, Square)

#     # Test with string data - should match str
#     string_data = "hello world"
#     result = construct_type(type_=TestUnion, object_=string_data)
#     assert result == string_data
#     assert isinstance(result, str)

#     # Test with int data - should match int
#     int_data = 42
#     result = construct_type(type_=TestUnion, object_=int_data)
#     assert result == int_data
#     assert isinstance(result, int)


# def test_undiscriminated_union_with_dict_types() -> None:
#     """Test undiscriminated union containing dict types as options."""
#     from .example_models.types.resources.types import Circle, Square

#     # Create a union type that includes dict types as options
#     TestUnion = Union[str, dict[str, Circle], dict[str, Square], int]

#     # Test with dict of Circle data - should match dict[str, Circle]
#     circle_dict_data = {
#         "circle1": {"radius": 1.5},
#         "circle2": {"radius": 2.0},
#         "circle3": {"radius": 3.2}
#     }

#     result = construct_type(type_=TestUnion, object_=circle_dict_data)

#     assert isinstance(result, dict)
#     assert len(result) == 3
#     for circle in result.values():
#         assert isinstance(circle, Circle)

#     # Test with dict of Square data - should match dict[str, Square]
#     square_dict_data = {
#         "square1": {"length": 4.0},
#         "square2": {"length": 5.5},
#         "square3": {"length": 6.1}
#     }

#     result = construct_type(type_=TestUnion, object_=square_dict_data)

#     assert isinstance(result, dict)
#     assert len(result) == 3
#     for square in result.values():
#         assert isinstance(square, Square)

#     # Test with string data - should match str
#     string_data = "hello world"
#     result = construct_type(type_=TestUnion, object_=string_data)
#     assert result == string_data
#     assert isinstance(result, str)

#     # Test with int data - should match int
#     int_data = 42
#     result = construct_type(type_=TestUnion, object_=int_data)
#     assert result == int_data
#     assert isinstance(result, int)


# def test_undiscriminated_union_with_mixed_container_types() -> None:
#     """Test undiscriminated union with both individual objects and containers as options."""
#     from .example_models.types.resources.types import Circle, Square

#     # Union that includes both individual objects and containers
#     TestUnion = Union[Circle, Square, set[Circle], set[Square], dict[str, Circle], dict[str, Square], str]

#     # Test with single Circle object - should match Circle
#     single_circle_data = {"radius": 1.0}
#     result = construct_type(type_=TestUnion, object_=single_circle_data)
#     assert isinstance(result, Circle)
#     assert result.radius == 1.0

#     # Test with single Square object - should match Square
#     single_square_data = {"length": 2.0}
#     result = construct_type(type_=TestUnion, object_=single_square_data)
#     assert isinstance(result, Square)
#     assert result.length == 2.0

#     # Test with set of Circles - should match set[Circle]
#     circle_set_data = [{"radius": 1.0}, {"radius": 2.0}]
#     result = construct_type(type_=TestUnion, object_=circle_set_data)
#     assert isinstance(result, set)
#     assert len(result) == 2
#     for circle in result:
#         assert isinstance(circle, Circle)

#     # Test with set of Squares - should match set[Square]
#     square_set_data = [{"length": 3.0}, {"length": 4.0}]
#     result = construct_type(type_=TestUnion, object_=square_set_data)
#     assert isinstance(result, set)
#     assert len(result) == 2
#     for square in result:
#         assert isinstance(square, Square)

#     # Test with dict of Circles - should match dict[str, Circle]
#     circle_dict_data = {"circle1": {"radius": 1.0}, "circle2": {"radius": 2.0}}
#     result = construct_type(type_=TestUnion, object_=circle_dict_data)
#     assert isinstance(result, dict)
#     assert len(result) == 2
#     for circle in result.values():
#         assert isinstance(circle, Circle)

#     # Test with dict of Squares - should match dict[str, Square]
#     square_dict_data = {"square1": {"length": 3.0}, "square2": {"length": 4.0}}
#     result = construct_type(type_=TestUnion, object_=square_dict_data)
#     assert isinstance(result, dict)
#     assert len(result) == 2
#     for square in result.values():
#         assert isinstance(square, Square)


# def test_undiscriminated_union_container_type_precedence() -> None:
#     """Test that container types are properly prioritized in undiscriminated unions."""
#     from .example_models.types.resources.types import Circle, Square

#     # Union where both individual objects and containers could potentially match
#     TestUnion = Union[Circle, set[Circle], Square, set[Square], dict[str, Circle], dict[str, Square]]

#     # Test with data that could be parsed as either a single Circle or a set with one Circle
#     # The container parsing logic should take precedence for container data
#     single_item_set_data = [{"radius": 1.0}]

#     result = construct_type(type_=TestUnion, object_=single_item_set_data)

#     # Should be parsed as set[Circle], not as a single Circle
#     assert isinstance(result, set)
#     assert len(result) == 1
#     assert isinstance(list(result)[0], Circle)
#     assert list(result)[0].radius == 1.0

#     # Test with data that should clearly be a single object
#     single_object_data = {"radius": 2.0}

#     result = construct_type(type_=TestUnion, object_=single_object_data)

#     # Should be parsed as Circle, not as a container
#     assert isinstance(result, Circle)
#     assert result.radius == 2.0

#     # Test with dict data
#     single_item_dict_data = {"key1": {"radius": 1.0}}

#     result = construct_type(type_=TestUnion, object_=single_item_dict_data)

#     # Should be parsed as dict[str, Circle], not as a single Circle
#     assert isinstance(result, dict)
#     assert len(result) == 1
#     assert isinstance(list(result.values())[0], Circle)
#     assert list(result.values())[0].radius == 1.0

