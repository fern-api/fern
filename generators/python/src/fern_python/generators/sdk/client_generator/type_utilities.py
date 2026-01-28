"""
Shared utilities for type checking in the SDK client generator.

This module provides common type-checking logic used across various generators
to determine how types should be serialized in different contexts (query params,
headers, multipart form data, etc.).
"""

from typing import Callable, Set
import fern.ir.resources as ir_types


# Primitive types that httpx can serialize directly without JSON encoding.
# These are the types that can be passed as-is to httpx's data= parameter
# in multipart form data requests.
HTTPX_PRIMITIVE_DATA_TYPES: Set[ir_types.PrimitiveTypeV1] = {
    ir_types.PrimitiveTypeV1.STRING,
    ir_types.PrimitiveTypeV1.INTEGER,
    ir_types.PrimitiveTypeV1.DOUBLE,
    ir_types.PrimitiveTypeV1.BOOLEAN,
    ir_types.PrimitiveTypeV1.LONG,
    ir_types.PrimitiveTypeV1.UINT,
    ir_types.PrimitiveTypeV1.UINT_64,
    ir_types.PrimitiveTypeV1.FLOAT,
}


def is_type_primitive_for_multipart(
    type_reference: ir_types.TypeReference,
    get_type_declaration: Callable[[ir_types.TypeId], ir_types.TypeDeclaration],
) -> bool:
    """
    Check if a type can be passed directly in multipart form data without JSON serialization.

    Returns True for: primitives, enums, literals, undiscriminated unions of primitives,
    optional/nullable wrappers, and aliases resolving to primitives.

    Returns False for: objects, lists, sets, maps, discriminated unions, unknown (Any),
    and undiscriminated unions containing complex types.
    """

    def check_type(tr: ir_types.TypeReference) -> bool:
        """Recursively check if a type is primitive."""
        type_union = tr.get_as_union()

        if type_union.type == "primitive":
            return type_union.primitive.v_1 in HTTPX_PRIMITIVE_DATA_TYPES

        elif type_union.type == "container":
            container = type_union.container.get_as_union()

            if container.type == "optional":
                return check_type(container.optional)

            elif container.type == "nullable":
                return check_type(container.nullable)

            elif container.type == "literal":
                literal = container.literal.get_as_union()
                if literal.type == "string":
                    return ir_types.PrimitiveTypeV1.STRING in HTTPX_PRIMITIVE_DATA_TYPES
                elif literal.type == "boolean":
                    return ir_types.PrimitiveTypeV1.BOOLEAN in HTTPX_PRIMITIVE_DATA_TYPES
                return False

            else:
                return False

        elif type_union.type == "named":
            type_declaration = get_type_declaration(type_union.type_id)
            shape = type_declaration.shape.get_as_union()

            # Alias - follow the chain
            if shape.type == "alias":
                return check_type(shape.alias_of)

            elif shape.type == "enum":
                return True

            elif shape.type == "undiscriminatedUnion":
                return all(check_type(member.type) for member in shape.members)

            else:
                return False

        elif type_union.type == "unknown":
            return False

        return False

    return check_type(type_reference)
