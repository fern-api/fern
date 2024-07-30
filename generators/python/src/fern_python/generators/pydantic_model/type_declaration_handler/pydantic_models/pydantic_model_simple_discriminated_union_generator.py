from typing import List, Optional, Set, Union

import fern.ir.resources as ir_types

from fern_python.codegen import AST, LocalClassReference, SourceFile
from fern_python.generators.pydantic_model.fern_aware_pydantic_model import (
    FernAwarePydanticModel,
)
from fern_python.generators.pydantic_model.type_declaration_handler.discriminated_union.simple_discriminated_union_generator import (
    get_single_union_type_class_name,
)
from fern_python.pydantic_codegen import PydanticField, PydanticModel
from fern_python.pydantic_codegen.pydantic_field import FernAwarePydanticField
from fern_python.snippet import SnippetWriter

from ....context import PydanticGeneratorContext
from ...custom_config import PydanticModelCustomConfig
from ..discriminated_union.simple_discriminated_union_generator import (
    AbstractDiscriminatedUnionSnippetGenerator,
    AbstractSimpleDiscriminatedUnionGenerator,
)


class PydanticModelSimpleDiscriminatedUnionGenerator(AbstractSimpleDiscriminatedUnionGenerator):
    def __init__(
        self,
        name: ir_types.DeclaredTypeName,
        union: ir_types.UnionTypeDeclaration,
        context: PydanticGeneratorContext,
        source_file: SourceFile,
        custom_config: PydanticModelCustomConfig,
        docs: Optional[str],
        snippet: Optional[str],
        should_generate: bool = True,
    ):
        super().__init__(
            name=name,
            union=union,
            context=context,
            custom_config=custom_config,
            source_file=source_file,
            docs=docs,
            snippet=snippet,
            should_generate=should_generate,
        )

    def _generate_union_class_name(self) -> str:
        return self._context.get_class_name_for_type_id(self._name.type_id, as_request=False)

    def _generate_base_class(self) -> None:
        if self._should_generate_base_class:
            with FernAwarePydanticModel(
                class_name=self._base_class_name,
                type_name=self._name,
                extends=[],
                context=self._context,
                custom_config=self._custom_config,
                source_file=self._source_file,
                docstring=None,
                snippet=self._snippet,
                should_export=False,
            ) as base_union_pydantic_model:
                for field in self._base_class_properties:
                    base_union_pydantic_model.add_field(**vars(field))

    def _maybe_wrap_type_hint(self, type_hint: AST.TypeHint) -> AST.TypeHint:
        if self._custom_config.skip_validation:
            return AST.TypeHint.annotated(
                type=type_hint,
                annotation=AST.Expression(
                    AST.ClassInstantiation(
                        class_=self._context.core_utilities.get_union_metadata(),
                        kwargs=[
                            (
                                "discriminant",
                                AST.Expression(f'"{self._union.discriminant.wire_value}"'),
                            )
                        ],
                    )
                ),
            )
        return type_hint

    def _generate_member_name(self, single_union_type: ir_types.SingleUnionType) -> str:
        return get_single_union_type_class_name(self._name, single_union_type.discriminant_value)

    def _generate_no_property_member(
        self, class_name: str, discriminant_field: FernAwarePydanticField
    ) -> LocalClassReference:
        with FernAwarePydanticModel(
            type_name=None,
            class_name=class_name,
            context=self._context,
            custom_config=self._custom_config,
            source_file=self._source_file,
            docstring=self._docs,
            snippet=self._snippet,
            base_models=[self._class_reference_for_base] if self._class_reference_for_base is not None else [],
        ) as internal_pydantic_model_for_single_union_type:
            internal_pydantic_model_for_single_union_type.add_field(**vars(discriminant_field))

            return internal_pydantic_model_for_single_union_type.to_reference()

    def _generate_single_property_member(
        self,
        class_name: str,
        single_union_type: ir_types.SingleUnionType,
        properties: List[PydanticField],
        fern_aware_properties: List[FernAwarePydanticField],
    ) -> LocalClassReference:
        with PydanticModel(
            version=self._custom_config.version,
            name=class_name,
            source_file=self._source_file,
            base_models=[self._class_reference_for_base] if self._class_reference_for_base is not None else [],
            frozen=self._custom_config.frozen,
            orm_mode=self._custom_config.orm_mode,
            smart_union=self._custom_config.smart_union,
            pydantic_base_model=self._context.core_utilities.get_unchecked_pydantic_base_model(),
            require_optional_fields=self._custom_config.require_optional_fields,
            is_pydantic_v2=self._context.core_utilities.get_is_pydantic_v2(),
            universal_field_validator=self._context.core_utilities.universal_field_validator,
            universal_root_validator=self._context.core_utilities.universal_root_validator,
            update_forward_ref_function_reference=self._context.core_utilities.get_update_forward_refs(),
        ) as internal_pydantic_model_for_single_union_type:
            for pydantic_field in properties:
                internal_pydantic_model_for_single_union_type.add_field(pydantic_field)

            self._update_forward_refs(
                internal_pydantic_model_for_single_union_type=internal_pydantic_model_for_single_union_type,
                single_union_type=single_union_type,
            )

            return internal_pydantic_model_for_single_union_type.to_reference()

    def _generate_same_properties_as_object_member(
        self, class_name: str, properties: List[FernAwarePydanticField]
    ) -> LocalClassReference:
        with FernAwarePydanticModel(
            type_name=None,
            class_name=class_name,
            context=self._context,
            custom_config=self._custom_config,
            source_file=self._source_file,
            docstring=self._docs,
            snippet=self._snippet,
            base_models=[self._class_reference_for_base] if self._class_reference_for_base is not None else [],
        ) as internal_pydantic_model_for_single_union_type:
            for field in properties:
                internal_pydantic_model_for_single_union_type.add_field(**vars(field))

            return internal_pydantic_model_for_single_union_type.to_reference()

    def _finish(self, type_alias_declaration: AST.TypeAliasDeclaration) -> None:
        for referenced_type in self._all_referenced_types:
            for type_id in self._context.get_type_names_in_type_reference(referenced_type):
                type_alias_declaration.add_ghost_reference(
                    self._context.get_class_reference_for_type_id(
                        type_id,
                        must_import_after_current_declaration=lambda other_type_name: self._context.does_type_reference_other_type(
                            other_type_name.type_id, type_id
                        ),
                        as_request=False,
                    ),
                )

    def _update_forward_refs(
        self,
        internal_pydantic_model_for_single_union_type: PydanticModel,
        single_union_type: ir_types.SingleUnionType,
    ) -> None:
        # if any of our fields are forward refs, we need to call
        # update_forwards_refs()

        # we assume that the forward-refed types are the ones
        # that circularly reference this union type
        referenced_type_ids: Set[ir_types.TypeId] = single_union_type.shape.visit(
            same_properties_as_object=lambda type_name: self._context.get_referenced_types(type_name.type_id),
            single_property=lambda single_property: self._context.get_referenced_types_of_type_reference(
                single_property.type
            ),
            no_properties=lambda: set(),
        )
        forward_refed_types = [
            referenced_type_id
            for referenced_type_id in referenced_type_ids
            if (
                referenced_type_id not in self._extended_types
                or (referenced_type_id in self._extended_types and referenced_type_id in self._property_type_ids)
            )
            and referenced_type_id != self._name.type_id
            and self._context.does_type_reference_other_type(referenced_type_id, self._name.type_id)
        ]
        if len(forward_refed_types) > 0:
            # when calling update_forward_refs, Pydantic will throw
            # if an inherited field's type is not defined in this
            # file. https://github.com/pydantic/pydantic/issues/4902.
            # as a workaround, we explicitly pass references to update_forward_refs
            # so they are in scope
            internal_pydantic_model_for_single_union_type.update_forward_refs(
                {
                    self._context.get_class_reference_for_type_id(type_id, as_request=False)
                    for type_id in forward_refed_types
                }
            )


class PydanticModelDiscriminatedUnionSnippetGenerator(AbstractDiscriminatedUnionSnippetGenerator):
    def __init__(
        self,
        snippet_writer: SnippetWriter,
        name: ir_types.DeclaredTypeName,
        example: Optional[ir_types.ExampleUnionType],
        example_expression: Optional[AST.Expression] = None,
        single_union_type: Optional[ir_types.SingleUnionType] = None,
    ):
        super().__init__(
            snippet_writer=snippet_writer,
            name=name,
            example=example,
            example_expression=example_expression,
            single_union_type=single_union_type,
            use_typeddict_request=False,
            as_request=False,
        )

    def _get_snippet_for_union_with_same_properties_as_object(
        self,
        name: ir_types.DeclaredTypeName,
        discriminant_field_name: ir_types.NameAndWireValue,
        wire_discriminant_value: ir_types.NameAndWireValue,
        example: Union[ir_types.ExampleObjectTypeWithTypeId, AST.Expression],
    ) -> AST.Expression:
        args: List[AST.Expression] = []
        if isinstance(example, ir_types.ExampleObjectTypeWithTypeId):
            args.extend(
                self.snippet_writer.get_snippet_for_object_properties(
                    example=example.object,
                    request_parameter_names={},
                    use_typeddict_request=self.use_typeddict_request,
                    as_request=self.as_request,
                ),
            )
        else:
            args.append(example)

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
        discriminant_field_name: ir_types.NameAndWireValue,
        wire_discriminant_value: ir_types.NameAndWireValue,
        example: Union[ir_types.ExampleTypeReference, AST.Expression],
    ) -> AST.Expression:
        union_class_reference = self._get_union_class_reference(
            name=name,
            wire_discriminant_value=wire_discriminant_value,
        )
        union_value = (
            self.snippet_writer.get_snippet_for_example_type_reference(
                example_type_reference=example,
                use_typeddict_request=self.use_typeddict_request,
                as_request=self.as_request,
            )
            if isinstance(example, ir_types.ExampleTypeReference)
            else example
        )

        def write_union(writer: AST.NodeWriter) -> None:
            if union_value is not None:
                writer.write_node(AST.Expression(union_class_reference))
                writer.write("(")
                writer.write("value=")
                writer.write_node(union_value)
                writer.write(")")
            else:
                writer.write_node(AST.Expression(union_class_reference))
                writer.write("(")
                writer.write(")")

        return AST.Expression(AST.CodeWriter(write_union))

    def _get_snippet_for_union_with_no_properties(
        self,
        name: ir_types.DeclaredTypeName,
        discriminant_field_name: ir_types.NameAndWireValue,
        wire_discriminant_value: ir_types.NameAndWireValue,
    ) -> AST.Expression:
        union_class_reference = self.snippet_writer.get_class_reference_for_declared_type_name(
            name=name, as_request=False
        )

        def write_union(writer: AST.NodeWriter) -> None:
            writer.write_node(AST.Expression(union_class_reference))
            writer.write("()")

        return AST.Expression(AST.CodeWriter(write_union))
