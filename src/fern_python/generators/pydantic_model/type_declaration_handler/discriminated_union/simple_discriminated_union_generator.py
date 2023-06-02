from typing import List, Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST, LocalClassReference, SourceFile
from fern_python.codegen.ast.references.class_reference import ClassReference
from fern_python.generators.pydantic_model.fern_aware_pydantic_model import (
    FernAwarePydanticModel,
)
from fern_python.pydantic_codegen import PydanticField, PydanticModel

from ...context import PydanticGeneratorContext
from ...custom_config import PydanticModelCustomConfig
from ..abstract_type_generator import AbstractTypeGenerator


class SimpleDiscriminatedUnionGenerator(AbstractTypeGenerator):
    BASE_CLASS_NAME = "Base"
    BASE_CLASS_NAME_WITH_UNDERSCORE = "_Base"

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

        class_reference_for_base = None
        if len(self._union.base_properties) > 0:
            is_base_class_name_present = False
            for single_union_type in self._union.types:
                type_union = single_union_type.shape.get_as_union()
                if (
                    type_union.properties_type == "samePropertiesAsObject"
                    and type_union.name.pascal_case == SimpleDiscriminatedUnionGenerator.BASE_CLASS_NAME
                ):
                    is_base_class_name_present = True

            base_class_name = (
                SimpleDiscriminatedUnionGenerator.BASE_CLASS_NAME_WITH_UNDERSCORE
                if is_base_class_name_present
                else SimpleDiscriminatedUnionGenerator.BASE_CLASS_NAME
            )
            with FernAwarePydanticModel(
                class_name=base_class_name,
                type_name=self._name,
                extends=[],
                context=self._context,
                custom_config=self._custom_config,
                source_file=self._source_file,
                docstring=None,
                should_export=False,
            ) as base_union_pydantic_model:
                for property in self._union.base_properties:
                    base_union_pydantic_model.add_field(
                        name=property.name.name.snake_case.safe_name,
                        pascal_case_field_name=property.name.name.pascal_case.unsafe_name,
                        type_reference=property.value_type,
                        json_field_name=property.name.wire_value,
                        description=property.docs,
                    )
                class_reference_for_base = ClassReference(
                    qualified_name_excluding_import=(base_class_name,),
                )

        for single_union_type in self._union.types:

            single_union_type_class_reference = single_union_type.shape.visit(
                same_properties_as_object=lambda type_name: self._context.get_class_reference_for_type_name(type_name),
                single_property=lambda property_: None,
                no_properties=lambda: None,
            )
            base_models = []
            if single_union_type_class_reference is not None:
                base_models.append(single_union_type_class_reference)
            if class_reference_for_base is not None:
                base_models.append(class_reference_for_base)

            with PydanticModel(
                name=f"{self._name.name.pascal_case.unsafe_name}_{single_union_type.discriminant_value.name.pascal_case.unsafe_name}",
                source_file=self._source_file,
                base_models=base_models,
                frozen=self._custom_config.frozen,
                orm_mode=self._custom_config.orm_mode,
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
                type_hint=AST.TypeHint.union(*(AST.TypeHint(ref) for ref in single_union_type_references)),
                name=self._name.name.pascal_case.safe_name,
            ),
            should_export=True,
        )

    def _get_discriminant_field_for_single_union_type(
        self, single_union_type: ir_types.SingleUnionType
    ) -> PydanticField:
        discriminant_value = self._get_discriminant_value_for_single_union_type(single_union_type)
        return PydanticField(
            name=self._get_discriminant_attr_name(),
            pascal_case_field_name=self._union.discriminant.name.pascal_case.unsafe_name,
            type_hint=AST.TypeHint.literal(discriminant_value),
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
