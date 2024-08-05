from typing import cast

import fern.ir.resources as ir_types
from typing_extensions import assert_never

from fern_python.codegen import AST

from ...context import FastApiGeneratorContext


def convert_to_singular_type(context: FastApiGeneratorContext, type: ir_types.TypeReference) -> AST.TypeHint:
    union = type.get_as_union()
    if union.type == "primitive" or union.type == "unknown":
        return context.pydantic_generator_context.get_type_hint_for_type_reference(type)
    elif union.type == "container":
        container_union = union.container.get_as_union()
        if container_union.type == "optional":
            return AST.TypeHint.optional(wrapped_type=convert_to_singular_type(context, container_union.optional))
    elif union.type == "named":
        declaration = context.pydantic_generator_context.get_declaration_for_type_id(union.type_id)
        shape_union = declaration.shape.get_as_union()
        if shape_union.type == "enum":
            return context.pydantic_generator_context.get_type_hint_for_type_reference(type)
        elif shape_union.type == "alias":
            resolved_type_union = shape_union.resolved_type.get_as_union()
            if resolved_type_union.type == "primitive":
                return convert_to_singular_type(
                    context, ir_types.TypeReference.factory.primitive(resolved_type_union.primitive)
                )
            elif resolved_type_union.type == "container":
                return convert_to_singular_type(
                    context, ir_types.TypeReference.factory.container(resolved_type_union.container)
                )
            elif resolved_type_union.type == "named":
                return convert_to_singular_type(
                    context, ir_types.TypeReference.factory.named(cast(ir_types.NamedType, resolved_type_union.name))
                )
            elif resolved_type_union.type == "unknown":
                return convert_to_singular_type(context, ir_types.TypeReference.factory.unknown())
            elif resolved_type_union.type != "void":
                assert_never(resolved_type_union)
        elif (
            shape_union.type != "object" and shape_union.type != "union" and shape_union.type != "undiscriminatedUnion"
        ):
            assert_never(shape_union)
    elif union.type != "void":
        assert_never(union)
    raise ValueError(f"Provided type is not a singular type: {type}")
