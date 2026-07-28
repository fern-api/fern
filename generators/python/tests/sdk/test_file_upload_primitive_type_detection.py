"""
Tests for the is_type_primitive_for_multipart utility.

These tests verify that literal types, enums, and primitives are correctly
identified as "primitive" (can be passed directly in multipart form data),
while complex types like objects, lists, and unknown are correctly identified
as needing JSON serialization.
"""

import fern.ir.resources as ir_types

from fern_python.generators.sdk.client_generator.type_utilities import (
    is_type_list_of_primitives_for_multipart,
    is_type_primitive_for_multipart,
)


def _primitive(primitive: ir_types.PrimitiveTypeV1) -> ir_types.TypeReference:
    return ir_types.TypeReference.factory.primitive(ir_types.PrimitiveType(v_1=primitive, v_2=None))


def _no_declaration_lookup(type_id: ir_types.TypeId) -> ir_types.TypeDeclaration:
    """Mock that raises if called - used for types that shouldn't need lookup."""
    raise AssertionError(f"Unexpected declaration lookup for {type_id}")


class TestPrimitiveTypeDetection:
    def test_string_literal_is_primitive(self) -> None:
        type_ref = ir_types.TypeReference.factory.container(
            ir_types.ContainerType.factory.literal(ir_types.Literal.factory.string("model_v1"))
        )
        assert is_type_primitive_for_multipart(type_ref, _no_declaration_lookup) is True

    def test_boolean_literal_is_primitive(self) -> None:
        type_ref = ir_types.TypeReference.factory.container(
            ir_types.ContainerType.factory.literal(ir_types.Literal.factory.boolean(True))
        )
        assert is_type_primitive_for_multipart(type_ref, _no_declaration_lookup) is True

    def test_optional_literal_is_primitive(self) -> None:
        literal = ir_types.TypeReference.factory.container(
            ir_types.ContainerType.factory.literal(ir_types.Literal.factory.string("value"))
        )
        type_ref = ir_types.TypeReference.factory.container(ir_types.ContainerType.factory.optional(literal))
        assert is_type_primitive_for_multipart(type_ref, _no_declaration_lookup) is True

    def test_string_is_primitive(self) -> None:
        type_ref = ir_types.TypeReference.factory.primitive(
            ir_types.PrimitiveType(v_1=ir_types.PrimitiveTypeV1.STRING, v_2=None)
        )
        assert is_type_primitive_for_multipart(type_ref, _no_declaration_lookup) is True

    def test_integer_is_primitive(self) -> None:
        type_ref = ir_types.TypeReference.factory.primitive(
            ir_types.PrimitiveType(v_1=ir_types.PrimitiveTypeV1.INTEGER, v_2=None)
        )
        assert is_type_primitive_for_multipart(type_ref, _no_declaration_lookup) is True

    def test_optional_string_is_primitive(self) -> None:
        inner = ir_types.TypeReference.factory.primitive(
            ir_types.PrimitiveType(v_1=ir_types.PrimitiveTypeV1.STRING, v_2=None)
        )
        type_ref = ir_types.TypeReference.factory.container(ir_types.ContainerType.factory.optional(inner))
        assert is_type_primitive_for_multipart(type_ref, _no_declaration_lookup) is True

    # =========================================================================
    # Complex types should NOT be primitive (must be JSON serialized)

    def test_unknown_is_not_primitive(self) -> None:
        type_ref = ir_types.TypeReference.factory.unknown()
        assert is_type_primitive_for_multipart(type_ref, _no_declaration_lookup) is False

    def test_optional_unknown_is_not_primitive(self) -> None:
        inner = ir_types.TypeReference.factory.unknown()
        type_ref = ir_types.TypeReference.factory.container(ir_types.ContainerType.factory.optional(inner))
        assert is_type_primitive_for_multipart(type_ref, _no_declaration_lookup) is False

    def test_list_is_not_primitive(self) -> None:
        inner = ir_types.TypeReference.factory.primitive(
            ir_types.PrimitiveType(v_1=ir_types.PrimitiveTypeV1.STRING, v_2=None)
        )
        type_ref = ir_types.TypeReference.factory.container(ir_types.ContainerType.factory.list_(inner))
        assert is_type_primitive_for_multipart(type_ref, _no_declaration_lookup) is False

    def test_map_is_not_primitive(self) -> None:
        key = ir_types.TypeReference.factory.primitive(
            ir_types.PrimitiveType(v_1=ir_types.PrimitiveTypeV1.STRING, v_2=None)
        )
        value = ir_types.TypeReference.factory.primitive(
            ir_types.PrimitiveType(v_1=ir_types.PrimitiveTypeV1.STRING, v_2=None)
        )
        type_ref = ir_types.TypeReference.factory.container(
            ir_types.ContainerType.factory.map_(ir_types.MapType(key_type=key, value_type=value))
        )
        assert is_type_primitive_for_multipart(type_ref, _no_declaration_lookup) is False


class TestListOfPrimitivesDetection:
    """
    Tests for is_type_list_of_primitives_for_multipart: list/set of primitives must be
    sent as repeated form fields (True), everything else JSON-serialized (False).
    """

    def test_list_of_strings_is_list_of_primitives(self) -> None:
        type_ref = ir_types.TypeReference.factory.container(
            ir_types.ContainerType.factory.list_(_primitive(ir_types.PrimitiveTypeV1.STRING))
        )
        assert is_type_list_of_primitives_for_multipart(type_ref, _no_declaration_lookup) is True

    def test_set_of_integers_is_list_of_primitives(self) -> None:
        type_ref = ir_types.TypeReference.factory.container(
            ir_types.ContainerType.factory.set_(_primitive(ir_types.PrimitiveTypeV1.INTEGER))
        )
        assert is_type_list_of_primitives_for_multipart(type_ref, _no_declaration_lookup) is True

    def test_optional_list_of_strings_is_list_of_primitives(self) -> None:
        inner = ir_types.TypeReference.factory.container(
            ir_types.ContainerType.factory.list_(_primitive(ir_types.PrimitiveTypeV1.STRING))
        )
        type_ref = ir_types.TypeReference.factory.container(ir_types.ContainerType.factory.optional(inner))
        assert is_type_list_of_primitives_for_multipart(type_ref, _no_declaration_lookup) is True

    def test_nullable_list_of_longs_is_list_of_primitives(self) -> None:
        inner = ir_types.TypeReference.factory.container(
            ir_types.ContainerType.factory.list_(_primitive(ir_types.PrimitiveTypeV1.LONG))
        )
        type_ref = ir_types.TypeReference.factory.container(ir_types.ContainerType.factory.nullable(inner))
        assert is_type_list_of_primitives_for_multipart(type_ref, _no_declaration_lookup) is True

    def test_scalar_string_is_not_list_of_primitives(self) -> None:
        assert (
            is_type_list_of_primitives_for_multipart(
                _primitive(ir_types.PrimitiveTypeV1.STRING), _no_declaration_lookup
            )
            is False
        )

    def test_map_is_not_list_of_primitives(self) -> None:
        key = _primitive(ir_types.PrimitiveTypeV1.STRING)
        value = _primitive(ir_types.PrimitiveTypeV1.STRING)
        type_ref = ir_types.TypeReference.factory.container(
            ir_types.ContainerType.factory.map_(ir_types.MapType(key_type=key, value_type=value))
        )
        assert is_type_list_of_primitives_for_multipart(type_ref, _no_declaration_lookup) is False

    def test_list_of_unknown_is_not_list_of_primitives(self) -> None:
        type_ref = ir_types.TypeReference.factory.container(
            ir_types.ContainerType.factory.list_(ir_types.TypeReference.factory.unknown())
        )
        assert is_type_list_of_primitives_for_multipart(type_ref, _no_declaration_lookup) is False

    def test_list_of_lists_is_not_list_of_primitives(self) -> None:
        inner_list = ir_types.TypeReference.factory.container(
            ir_types.ContainerType.factory.list_(_primitive(ir_types.PrimitiveTypeV1.STRING))
        )
        type_ref = ir_types.TypeReference.factory.container(ir_types.ContainerType.factory.list_(inner_list))
        assert is_type_list_of_primitives_for_multipart(type_ref, _no_declaration_lookup) is False
