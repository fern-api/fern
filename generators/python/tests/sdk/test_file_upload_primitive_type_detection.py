"""
Tests for the is_type_primitive_for_multipart utility.

These tests verify that literal types, enums, and primitives are correctly
identified as "primitive" (can be passed directly in multipart form data),
while complex types like objects, lists, and unknown are correctly identified
as needing JSON serialization.
"""

import fern.ir.resources as ir_types

from fern_python.generators.sdk.client_generator.type_utilities import is_type_primitive_for_multipart


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
