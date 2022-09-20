from fern_python.codegen import AST
from fern_python.declaration_handler import DeclarationHandlerContext
from fern_python.generated import ir_types
from fern_python.pydantic_codegen import PydanticField, PydanticModel

from ..fern_aware_pydantic_model import FernAwarePydanticModel

VISITOR_RETURN_TYPE = AST.GenericTypeVar(name="T_Result")


def generate_union(
    name: ir_types.DeclaredTypeName,
    union: ir_types.UnionTypeDeclaration,
    context: DeclarationHandlerContext,
) -> None:

    with FernAwarePydanticModel(type_name=name, context=context) as external_pydantic_model:
        internal_union = context.source_file.add_class_declaration(
            declaration=AST.ClassDeclaration(name="_" + external_pydantic_model.get_class_name()),
            do_not_export=True,
        )

        for single_union_type in union.types:
            with PydanticModel(
                name=single_union_type.discriminant_value.pascal_case,
                source_file=context.source_file,
                base_models=single_union_type.shape._visit(
                    same_properties_as_object=lambda type_name: [context.get_class_reference_for_type_name(type_name)],
                    single_property=lambda property: None,
                    no_properties=lambda: None,
                ),
                parent=internal_union,
            ) as internal_pydantic_model_for_single_union_type:

                shape = single_union_type.shape.get()
                wire_discriminant_value = AST.CodeWriter(f'"{single_union_type.discriminant_value.wire_value}"')
                discriminant_field = PydanticField(
                    name=union.discriminant_v2.snake_case,
                    type_hint=AST.TypeHint.literal(wire_discriminant_value),
                    json_field_name=union.discriminant_v2.wire_value,
                )

                internal_pydantic_model_for_single_union_type.add_field(discriminant_field)

                if shape.properties_type == "singleProperty":
                    internal_pydantic_model_for_single_union_type.add_field(
                        PydanticField(
                            name=shape.name.camel_case,
                            type_hint=context.get_type_hint_for_type_reference(type_reference=shape.type),
                            json_field_name=shape.name.wire_value,
                        )
                    )

                def write_creator_body(writer: AST.NodeWriter, reference_resolver: AST.ReferenceResolver) -> None:
                    internal_union_instantiation = AST.ClassInstantiation(
                        class_=internal_union,
                        kwargs=[(discriminant_field.name, wire_discriminant_value)],
                    )

                    union_instantiation = AST.ClassInstantiation(
                        class_=external_pydantic_model.to_reference(),
                        kwargs=[("__root__", internal_union_instantiation)],
                    )

                    writer.write("return ")
                    writer.write_node(union_instantiation)

                external_pydantic_model.add_method(
                    name=single_union_type.discriminant_value.snake_case,
                    parameters=single_union_type.shape._visit(
                        same_properties_as_object=lambda type_name: [
                            ("value", ir_types.TypeReference.named(type_name))
                        ],
                        single_property=lambda property: [(property.name.camel_case, property.type)],
                        no_properties=lambda: [],
                    ),
                    return_type=ir_types.TypeReference.named(name),
                    body=AST.CodeWriter(write_creator_body),
                    is_static=True,
                )
