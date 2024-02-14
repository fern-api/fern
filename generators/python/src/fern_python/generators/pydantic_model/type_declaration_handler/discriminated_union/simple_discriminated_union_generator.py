from typing import List, Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST, LocalClassReference, SourceFile
from fern_python.codegen.ast.references.class_reference import ClassReference
from fern_python.generators.pydantic_model.fern_aware_pydantic_model import (
    FernAwarePydanticModel,
)
from fern_python.pydantic_codegen import PydanticField, PydanticModel
from fern_python.snippet import SnippetWriter

from ....context import PydanticGeneratorContext
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
        snippet: Optional[str],
    ):
        super().__init__(
            context=context, custom_config=custom_config, source_file=source_file, docs=docs, snippet=snippet
        )
        self._name = name
        self._union = union

    def generate(self) -> None:
        single_union_type_references: List[LocalClassReference] = []
        all_referenced_types: List[ir_types.TypeReference] = []

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
                snippet=self._snippet,
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
                    all_referenced_types.append(property.value_type)
                class_reference_for_base = ClassReference(
                    qualified_name_excluding_import=(base_class_name,),
                )

        for single_union_type in self._union.types:
            single_union_type_base = single_union_type.shape.visit(
                same_properties_as_object=lambda type_name: type_name,
                single_property=lambda property_: None,
                no_properties=lambda: None,
            )
            base_models = []
            if single_union_type_base is not None:
                base_models.append(self._context.get_class_reference_for_type_id(single_union_type_base.type_id))
                all_referenced_types.append(ir_types.TypeReference.factory.named(single_union_type_base))

            if class_reference_for_base is not None:
                base_models.append(class_reference_for_base)

            with PydanticModel(
                version=self._custom_config.version,
                name=get_single_union_type_class_name(self._name, single_union_type.discriminant_value),
                source_file=self._source_file,
                base_models=base_models,
                frozen=self._custom_config.frozen,
                orm_mode=self._custom_config.orm_mode,
                smart_union=self._custom_config.smart_union,
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
                    all_referenced_types.append(shape.type)

                # if any of our fields are forward refs, we need to call
                # update_forwards_refs()

                # we assume that the forward-refed types are the ones
                # that circularly reference this union type
                referenced_type_ids: List[ir_types.TypeId] = single_union_type.shape.visit(
                    same_properties_as_object=lambda type_name: self._context.get_referenced_types(type_name.type_id),
                    single_property=lambda single_property: self._context.get_referenced_types_of_type_reference(
                        single_property.type
                    ),
                    no_properties=lambda: [],
                )
                forward_refed_types = [
                    referenced_type_id
                    for referenced_type_id in referenced_type_ids
                    if self._context.does_type_reference_other_type(referenced_type_id, self._name.type_id)
                ]
                if len(forward_refed_types) > 0:
                    # when calling update_forward_refs, Pydantic will throw
                    # if an inherited field's type is not defined in this
                    # file. https://github.com/pydantic/pydantic/issues/4902.
                    # as a workaround, we explicitly pass references to update_forward_refs
                    # so they are in scope
                    internal_pydantic_model_for_single_union_type.update_forward_refs(
                        {self._context.get_class_reference_for_type_id(type_id) for type_id in forward_refed_types}
                    )

        type_alias_declaration = AST.TypeAliasDeclaration(
            type_hint=AST.TypeHint.union(*(AST.TypeHint(ref) for ref in single_union_type_references)),
            name=self._name.name.pascal_case.safe_name,
            snippet=self._snippet,
        )

        for referenced_type in all_referenced_types:
            for type_id in self._context.get_type_names_in_type_reference(referenced_type):
                type_alias_declaration.add_ghost_reference(
                    self._context.get_class_reference_for_type_id(
                        type_id,
                        must_import_after_current_declaration=lambda other_type_name: self._context.does_type_reference_other_type(
                            other_type_name.type_id, type_id
                        ),
                    ),
                )

        self._source_file.add_declaration(
            type_alias_declaration,
            should_export=True,
        )

    def _get_discriminant_field_for_single_union_type(
        self, single_union_type: ir_types.SingleUnionType
    ) -> PydanticField:
        discriminant_value = self._get_discriminant_value_for_single_union_type(single_union_type)
        return PydanticField(
            name=get_discriminant_parameter_name(self._union.discriminant),
            pascal_case_field_name=self._union.discriminant.name.pascal_case.unsafe_name,
            type_hint=AST.TypeHint.literal(discriminant_value),
            json_field_name=self._union.discriminant.wire_value,
        )

    def _get_discriminant_value_for_single_union_type(
        self,
        single_union_type: ir_types.SingleUnionType,
    ) -> AST.Expression:
        return AST.Expression(f'"{single_union_type.discriminant_value.wire_value}"')


class DiscriminatedUnionSnippetGenerator:
    def __init__(
        self,
        snippet_writer: SnippetWriter,
        name: ir_types.DeclaredTypeName,
        example: ir_types.ExampleUnionType,
    ):
        self.snippet_writer = snippet_writer
        self.name = name
        self.example = example

    def generate_snippet(self) -> AST.Expression:
        return self.example.single_union_type.shape.visit(
            same_properties_as_object=lambda object: self._get_snippet_for_union_with_same_properties_as_object(
                name=self.name,
                discriminant=self.example.discriminant,
                wire_discriminant_value=self.example.single_union_type.wire_discriminant_value,
                example=object,
            ),
            single_property=lambda example_type_reference: self._get_snippet_for_union_with_single_property(
                name=self.name,
                discriminant=self.example.discriminant,
                wire_discriminant_value=self.example.single_union_type.wire_discriminant_value,
                example=example_type_reference,
            ),
            no_properties=lambda: self._get_snippet_for_union_with_no_properties(
                name=self.name,
            ),
        )

    def _get_snippet_for_union_with_same_properties_as_object(
        self,
        name: ir_types.DeclaredTypeName,
        discriminant: ir_types.NameAndWireValue,
        wire_discriminant_value: ir_types.NameAndWireValue,
        example: ir_types.ExampleObjectTypeWithTypeId,
    ) -> AST.Expression:
        args: List[AST.Expression] = []
        args.append(
            self._get_snippet_for_union_discriminant_parameter(
                discriminant=discriminant,
                wire_discriminant_value=wire_discriminant_value,
            ),
        )
        args.extend(
            self.snippet_writer.get_snippet_for_object_properties(
                example=example.object,
            ),
        )

        union_class_reference = self._get_union_class_reference(
            name=name,
            wire_discriminant_value=wire_discriminant_value,
        )

        return AST.Expression(
            AST.ClassInstantiation(
                class_=union_class_reference,
                args=args,
            ),
        )

    def _get_snippet_for_union_with_single_property(
        self,
        name: ir_types.DeclaredTypeName,
        discriminant: ir_types.NameAndWireValue,
        wire_discriminant_value: ir_types.NameAndWireValue,
        example: ir_types.ExampleTypeReference,
    ) -> AST.Expression:
        union_class_reference = self._get_union_class_reference(
            name=name,
            wire_discriminant_value=wire_discriminant_value,
        )
        union_discriminant_parameter = self._get_snippet_for_union_discriminant_parameter(
            discriminant=discriminant,
            wire_discriminant_value=wire_discriminant_value,
        )
        union_value = self.snippet_writer.get_snippet_for_example_type_reference(
            example_type_reference=example,
        )

        def write_union(writer: AST.NodeWriter) -> None:
            if union_value is not None:
                writer.write_node(AST.Expression(union_class_reference))
                writer.write("(")
                writer.write_node(union_discriminant_parameter)
                writer.write(", ")
                writer.write("value=")
                writer.write_node(union_value)
                writer.write(")")
            else:
                writer.write_node(AST.Expression(union_class_reference))
                writer.write("(")
                writer.write_node(union_discriminant_parameter)
                writer.write(")")

        return AST.Expression(AST.CodeWriter(write_union))

    def _get_snippet_for_union_with_no_properties(
        self,
        name: ir_types.DeclaredTypeName,
    ) -> AST.Expression:
        union_class_reference = self.snippet_writer.get_class_reference_for_declared_type_name(
            name=name,
        )

        def write_union(writer: AST.NodeWriter) -> None:
            writer.write_node(AST.Expression(union_class_reference))
            writer.write("()")

        return AST.Expression(AST.CodeWriter(write_union))

    def _get_snippet_for_union_discriminant_parameter(
        self,
        discriminant: ir_types.NameAndWireValue,
        wire_discriminant_value: ir_types.NameAndWireValue,
    ) -> AST.Expression:
        return self.snippet_writer.get_snippet_for_named_parameter(
            parameter_name=get_discriminant_parameter_name(discriminant),
            value=AST.Expression(f'"{wire_discriminant_value.wire_value}"'),
        )

    def _get_union_class_reference(
        self,
        name: ir_types.DeclaredTypeName,
        wire_discriminant_value: ir_types.NameAndWireValue,
    ) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(),
            import_=AST.ReferenceImport(
                module=AST.Module.snippet(
                    module_path=self.snippet_writer.get_module_path_for_declared_type_name(
                        name=name,
                    ),
                ),
                named_import=get_single_union_type_class_name(
                    name=name, wire_discriminant_value=wire_discriminant_value
                ),
            ),
        )


def get_single_union_type_class_name(
    name: ir_types.DeclaredTypeName, wire_discriminant_value: ir_types.NameAndWireValue
) -> str:
    return f"{get_union_class_name(name)}_{wire_discriminant_value.name.pascal_case.unsafe_name}"


def get_union_class_name(name: ir_types.DeclaredTypeName) -> str:
    return name.name.pascal_case.unsafe_name


def get_discriminant_parameter_name(discriminant: ir_types.NameAndWireValue) -> str:
    return discriminant.name.snake_case.unsafe_name


def get_field_name_for_single_property(property: ir_types.SingleUnionTypeProperty) -> str:
    return property.name.name.snake_case.unsafe_name
