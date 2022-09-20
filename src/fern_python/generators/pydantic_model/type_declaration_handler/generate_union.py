from typing import List

from fern_python.codegen import AST, LocalClassReference
from fern_python.declaration_handler import DeclarationHandlerContext
from fern_python.generated import ir_types
from fern_python.pydantic_codegen import (
    PYDANTIC_FIELD_REFERENCE,
    PydanticField,
    PydanticModel,
)

from ..fern_aware_pydantic_model import FernAwarePydanticModel
from .get_visit_method import VisitableItem, VisitorArgument, get_visit_method

VISITOR_RETURN_TYPE = AST.GenericTypeVar(name="T_Result")


def generate_union(
    name: ir_types.DeclaredTypeName,
    union: ir_types.UnionTypeDeclaration,
    context: DeclarationHandlerContext,
) -> None:

    with FernAwarePydanticModel(type_name=name, context=context) as external_pydantic_model:
        internal_single_union_types: List[LocalClassReference] = []

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
                    single_property=lambda property_: None,
                    no_properties=lambda: None,
                ),
                parent=internal_union,
            ) as internal_pydantic_model_for_single_union_type:

                internal_single_union_type = internal_pydantic_model_for_single_union_type.to_reference()
                internal_single_union_types.append(internal_single_union_type)

                shape = single_union_type.shape.get()
                discriminant_field = get_discriminant_field_for_single_union_type(
                    union=union, single_union_type=single_union_type
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

                external_pydantic_model.add_method(
                    name=single_union_type.discriminant_value.snake_case,
                    parameters=single_union_type.shape._visit(
                        same_properties_as_object=lambda type_name: [
                            ("value", ir_types.TypeReference.named(type_name))
                        ],
                        single_property=lambda property: [(property.name.snake_case, property.type)],
                        no_properties=lambda: [],
                    ),
                    return_type=ir_types.TypeReference.named(name),
                    body=AST.CodeWriter(
                        create_body_writer(
                            properties=single_union_type.shape,
                            internal_single_union_type=internal_single_union_type,
                            external_union=external_pydantic_model.to_reference(),
                            discriminant_attr_name=discriminant_field.name,
                            discriminant_attr_value=get_discriminant_value_for_single_union_type(single_union_type),
                            context=context,
                        )
                    ),
                    is_static=True,
                )

        external_pydantic_model.add_method_unsafe(
            get_visit_method(
                items=[
                    VisitableItem(
                        parameter_name=single_union_type.discriminant_value.snake_case,
                        expected_value=single_union_type.discriminant_value.wire_value,
                        visitor_argument=single_union_type.shape._visit(
                            same_properties_as_object=lambda type_name: VisitorArgument(
                                expression=AST.Expression(AST.CodeWriter("self.__root__")),
                                type=external_pydantic_model.get_type_hint_for_type_reference(
                                    ir_types.TypeReference.named(type_name)
                                ),
                            ),
                            single_property=lambda property: VisitorArgument(
                                expression=AST.Expression(AST.CodeWriter(f"self.__root__.{property.name.snake_case}")),
                                type=external_pydantic_model.get_type_hint_for_type_reference(property.type),
                            ),
                            no_properties=lambda: None,
                        ),
                    )
                    for single_union_type in union.types
                ],
                reference_to_current_value=f"self.__root__.{get_discriminant_attr_name(union)}",
                are_checks_exhaustive=True,
            )
        )
        external_pydantic_model.set_root_type(
            is_forward_ref=True,
            root_type=AST.TypeHint.annotated(
                type=AST.TypeHint.union(
                    *(
                        AST.TypeHint(type=internal_single_union_type)
                        for internal_single_union_type in internal_single_union_types
                    ),
                ),
                annotation=AST.Expression(
                    AST.FunctionInvocation(
                        function_definition=PYDANTIC_FIELD_REFERENCE,
                        kwargs=[
                            (
                                "discriminator",
                                AST.Expression(
                                    AST.CodeWriter(f'"{get_discriminant_attr_name(union)}"'),
                                ),
                            )
                        ],
                    )
                ),
            ),
        )


def create_body_writer(
    properties: ir_types.SingleUnionTypeProperties,
    internal_single_union_type: AST.ClassReference,
    external_union: AST.ClassReference,
    discriminant_attr_name: str,
    discriminant_attr_value: AST.Expression,
    context: DeclarationHandlerContext,
) -> AST.ReferencingCodeWriter:
    def write(writer: AST.NodeWriter, reference_resolver: AST.ReferenceResolver) -> None:
        # explicit typing needed to help mypy
        no_expressions: List[AST.Expression] = []

        internal_single_union_type_instantiation = AST.ClassInstantiation(
            class_=internal_single_union_type,
            args=properties._visit(
                same_properties_as_object=lambda type_name: [
                    AST.Expression(
                        AST.FunctionInvocation(AST.Reference(qualified_name_excluding_import=("value", "dict"))),
                        spread=AST.ExpressionSpread.TWO_ASTERISKS,
                    )
                ],
                single_property=lambda property: no_expressions,
                no_properties=lambda: no_expressions,
            ),
            kwargs=[(discriminant_attr_name, discriminant_attr_value)]
            + properties._visit(
                same_properties_as_object=lambda type_name: [],
                single_property=lambda property: [
                    (property.name.snake_case, AST.Expression(AST.CodeWriter(property.name.snake_case)))
                ],
                no_properties=lambda: [],
            ),
        )

        sub_union_instantiation = AST.ClassInstantiation(
            class_=external_union,
            kwargs=[("__root__", AST.Expression(internal_single_union_type_instantiation))],
        )

        writer.write("return ")
        writer.write_node(sub_union_instantiation)

    return write


def get_discriminant_field_for_single_union_type(
    union: ir_types.UnionTypeDeclaration, single_union_type: ir_types.SingleUnionType
) -> PydanticField:
    return PydanticField(
        name=get_discriminant_attr_name(union),
        type_hint=AST.TypeHint.literal(get_discriminant_value_for_single_union_type(single_union_type)),
        json_field_name=union.discriminant_v2.wire_value,
    )


def get_discriminant_attr_name(union: ir_types.UnionTypeDeclaration) -> str:
    return union.discriminant_v2.snake_case


def get_discriminant_value_for_single_union_type(single_union_type: ir_types.SingleUnionType) -> AST.Expression:
    return AST.Expression(AST.CodeWriter(f'"{single_union_type.discriminant_value.wire_value}"'))
