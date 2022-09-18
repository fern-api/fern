from fern_python.codegen import AST
from fern_python.declaration_handler import DeclarationHandlerContext
from fern_python.generated import ir_types
from fern_python.pydantic_codegen import PydanticModel

from ..fern_aware_pydantic_model import FernAwarePydanticModel

VISITOR_RETURN_TYPE = AST.GenericTypeVar(name="T_Result")


def generate_union(
    name: ir_types.DeclaredTypeName,
    union: ir_types.UnionTypeDeclaration,
    context: DeclarationHandlerContext,
) -> None:
    external_pydantic_model = FernAwarePydanticModel(type_name=name, context=context)
    internal_union = AST.ClassDeclaration(name="_" + external_pydantic_model.get_name_of_pydantic_model())

    for single_union_type in union.types:
        shape = single_union_type.shape.get()

        internal_pydantic_model_for_single_union_type = PydanticModel(
            name=single_union_type.discriminant_value.pascal_case,
            base_models=single_union_type.shape._visit(
                same_properties_as_object=lambda type_name: [context.get_class_reference_for_type_name(type_name)],
                single_property=lambda property: None,
                no_properties=lambda: None,
            ),
        )

        internal_pydantic_model_for_single_union_type.add_field(
            name=union.discriminant_v2.camel_case,
            type_hint=AST.TypeHint.literal(f'"{single_union_type.discriminant_value.wire_value}"'),
            json_field_name=union.discriminant_v2.wire_value,
        )

        if shape.properties_type == "singleProperty":
            internal_pydantic_model_for_single_union_type.add_field(
                name=shape.name.camel_case,
                type_hint=context.get_type_hint_for_type_reference(type_reference=shape.type),
                json_field_name=shape.name.wire_value,
            )

        internal_union.add_class(declaration=internal_pydantic_model_for_single_union_type.finish())

        external_pydantic_model.add_method(
            name=single_union_type.discriminant_value.snake_case,
            parameters=single_union_type.shape._visit(
                same_properties_as_object=lambda type_name: [("value", ir_types.TypeReference.named(type_name))],
                single_property=lambda property: [(property.name.camel_case, property.type)],
                no_properties=lambda: [],
            ),
            return_type=ir_types.TypeReference.named(name),
            body=AST.CodeWriter("pass"),
            is_static=True,
        )

    external_pydantic_model.add_to_source_file()
    context.source_file.add_declaration(declaration=internal_union)
