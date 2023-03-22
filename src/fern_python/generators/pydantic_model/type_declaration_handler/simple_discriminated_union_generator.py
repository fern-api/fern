from typing import List, Optional

import fern.ir.pydantic as ir_types

from fern_python.codegen import AST, LocalClassReference, SourceFile
from fern_python.external_dependencies import Pydantic
from fern_python.pydantic_codegen import PydanticField, PydanticModel

from ..context import PydanticGeneratorContext
from ..custom_config import PydanticModelCustomConfig
from .abstract_type_generator import AbstractTypeGenerator


class SimpleDiscriminatedUnionGenerator(AbstractTypeGenerator):
    def __init__(
        self,
        name: ir_types.DeclaredTypeName,
        union: ir_types.UnionTypeDeclaration,
        context: PydanticGeneratorContext,
        source_file: SourceFile,
        custom_config: PydanticModelCustomConfig,
        docs: Optional[str],
    ):
        super().__init__(context=context, custom_config=custom_config, source_file=source_file, docs=docs)
        self._name = name
        self._union = union

    def generate(self) -> None:

        single_union_type_references: List[LocalClassReference] = []

        for single_union_type in self._union.types:
            with PydanticModel(
                name=f"{self._name.name.pascal_case.unsafe_name}_{single_union_type.discriminant_value.name.pascal_case.unsafe_name}",  # noqa: E501
                source_file=self._source_file,
                base_models=single_union_type.shape.visit(
                    same_properties_as_object=lambda type_name: [
                        self._context.get_class_reference_for_type_name(type_name)
                    ],
                    single_property=lambda property_: None,
                    no_properties=lambda: None,
                ),
            ) as internal_pydantic_model_for_single_union_type:

                internal_single_union_type = internal_pydantic_model_for_single_union_type.to_reference()
                single_union_type_references.append(internal_single_union_type)

                discriminant_field = self._get_discriminant_field_for_single_union_type(
                    single_union_type=single_union_type
                )

                internal_pydantic_model_for_single_union_type.add_field(discriminant_field)

                shape = single_union_type.shape.get_as_union()
                if shape.properties_type == "singleProperty":
                    internal_pydantic_model_for_single_union_type.add_field(
                        PydanticField(
                            name=shape.name.name.snake_case.unsafe_name,
                            pascal_case_field_name=shape.name.name.pascal_case.unsafe_name,
                            json_field_name=shape.name.wire_value,
                            type_hint=self._context.get_type_hint_for_type_reference(type_reference=shape.type),
                        )
                    )

                # if any of our inherited fields are forward refs, we need to call
                # update_forwards_refs()
                if shape.properties_type == "samePropertiesAsObject":
                    # we assume that the forward-refed types are the ones
                    # that circularly reference themselves
                    forward_refed_types = [
                        referenced_type
                        for referenced_type in self._context.get_declaration_for_type_name(shape).referenced_types
                        if self._context.does_circularly_reference_itself(referenced_type)
                    ]
                    if len(forward_refed_types) > 0:
                        # when calling update_forward_refs, Pydantic will throw
                        # if an inherited field's type is not defined in this
                        # file. https://github.com/pydantic/pydantic/issues/4902.
                        # as a workaround, we explicitly pass references to update_forward_refs
                        # so they are in scope
                        internal_pydantic_model_for_single_union_type.update_forward_refs(
                            {
                                self._context.get_class_reference_for_type_name(type_name)
                                for type_name in forward_refed_types
                            }
                        )

        self._source_file.add_declaration(
            AST.TypeAliasDeclaration(
                type_hint=AST.TypeHint.annotated(
                    type=AST.TypeHint.union(*(AST.TypeHint(ref) for ref in single_union_type_references)),
                    annotation=AST.Expression(
                        AST.FunctionInvocation(
                            function_definition=Pydantic.Field,
                            kwargs=[
                                (
                                    "discriminator",
                                    AST.Expression(
                                        f'"{self._get_discriminant_attr_name()}"',
                                    ),
                                )
                            ],
                        )
                    ),
                ),
                name=self._name.name.pascal_case.safe_name,
            ),
            should_export=True,
        )

    def _get_discriminant_field_for_single_union_type(
        self, single_union_type: ir_types.SingleUnionType
    ) -> PydanticField:
        return PydanticField(
            name=self._get_discriminant_attr_name(),
            pascal_case_field_name=self._union.discriminant.name.pascal_case.unsafe_name,
            type_hint=AST.TypeHint.literal(self._get_discriminant_value_for_single_union_type(single_union_type)),
            json_field_name=self._union.discriminant.wire_value,
        )

    def _get_discriminant_attr_name(self) -> str:
        return self._union.discriminant.name.snake_case.unsafe_name

    def _get_discriminant_value_for_single_union_type(
        self,
        single_union_type: ir_types.SingleUnionType,
    ) -> AST.Expression:
        return AST.Expression(f'"{single_union_type.discriminant_value.wire_value}"')


def get_field_name_for_single_property(property: ir_types.SingleUnionTypeProperty) -> str:
    return property.name.name.snake_case.unsafe_name
