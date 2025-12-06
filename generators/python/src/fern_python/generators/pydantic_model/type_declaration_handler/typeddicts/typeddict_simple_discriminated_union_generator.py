from typing import List, Optional, Union

import fern.ir.resources as ir_types
from ....context.pydantic_generator_context import PydanticGeneratorContext
from ...custom_config import PydanticModelCustomConfig, UnionNamingVersions
from ..discriminated_union.simple_discriminated_union_generator import (
    AbstractDiscriminatedUnionSnippetGenerator,
    AbstractSimpleDiscriminatedUnionGenerator,
    get_single_union_type_class_name,
)

from fern_python.codegen import AST, LocalClassReference, SourceFile
from fern_python.generators.pydantic_model.typeddict import (
    FernTypedDict,
    SimpleObjectProperty,
)
from fern_python.pydantic_codegen import PydanticField
from fern_python.pydantic_codegen.pydantic_field import FernAwarePydanticField
from fern_python.snippet import SnippetWriter


class TypeddictSimpleDiscriminatedUnionGenerator(AbstractSimpleDiscriminatedUnionGenerator):
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
        return self._context.get_class_name_for_type_id(self._name.type_id, as_request=True)

    def _generate_base_class(self) -> None:
        if self._should_generate_base_class:
            with FernTypedDict(
                class_name=self._base_class_name,
                type_name=self._name,
                context=self._context,
                source_file=self._source_file,
                docstring=None,
                should_export=False,
            ) as base_union_typed_dict:
                for field in self._base_class_properties:
                    base_union_typed_dict.add_field(**vars(field))

    def _maybe_wrap_type_hint(self, type_hint: AST.TypeHint) -> AST.TypeHint:
        return type_hint  # noop

    def _generate_member_name(self, single_union_type: ir_types.SingleUnionType) -> str:
        return (
            get_single_union_type_class_name(
                self._name, single_union_type.discriminant_value, self._custom_config.union_naming
            )
            + "Params"
        )

    def _generate_no_property_member(
        self, class_name: str, discriminant_field: FernAwarePydanticField
    ) -> LocalClassReference:
        with FernTypedDict(
            class_name=class_name,
            extended_references=[self._class_reference_for_base] if self._class_reference_for_base is not None else [],
            context=self._context,
            source_file=self._source_file,
            docstring=None,
            should_export=True,
        ) as member_typed_dict:
            member_typed_dict.add_field(**vars(discriminant_field))
            return member_typed_dict.to_reference()

    def _generate_single_property_member(
        self,
        class_name: str,
        single_union_type: ir_types.SingleUnionType,
        properties: List[PydanticField],
        fern_aware_properties: List[FernAwarePydanticField],
    ) -> LocalClassReference:
        with FernTypedDict(
            class_name=class_name,
            extended_references=[self._class_reference_for_base] if self._class_reference_for_base is not None else [],
            context=self._context,
            source_file=self._source_file,
            docstring=None,
            should_export=True,
            container_type_id=self._name.type_id,
        ) as member_typed_dict:
            for field in fern_aware_properties:
                member_typed_dict.add_field(**vars(field))

            return member_typed_dict.to_reference()

    def _generate_same_properties_as_object_member(
        self, member_type_id: ir_types.TypeId, class_name: str, properties: List[FernAwarePydanticField]
    ) -> LocalClassReference:
        with FernTypedDict(
            class_name=class_name,
            extended_references=[self._class_reference_for_base] if self._class_reference_for_base is not None else [],
            context=self._context,
            source_file=self._source_file,
            docstring=None,
            should_export=True,
            original_type_id=member_type_id,
        ) as member_typed_dict:
            for field in properties:
                member_typed_dict.add_field(**vars(field))
            return member_typed_dict.to_reference()

    def _finish(self, type_alias_declaration: AST.TypeAliasDeclaration) -> None:
        return


class TypeddictDiscriminatedUnionSnippetGenerator(AbstractDiscriminatedUnionSnippetGenerator):
    def __init__(
        self,
        snippet_writer: SnippetWriter,
        name: ir_types.DeclaredTypeName,
        example: Optional[ir_types.ExampleUnionType],
        union_naming_version: UnionNamingVersions,
        example_expression: Optional[AST.Expression] = None,
        single_union_type: Optional[ir_types.SingleUnionType] = None,
    ):
        super().__init__(
            snippet_writer=snippet_writer,
            name=name,
            example=example,
            example_expression=example_expression,
            single_union_type=single_union_type,
            use_typeddict_request=True,
            as_request=True,
            union_naming_version=union_naming_version,
        )

    def _get_snippet_for_union_with_same_properties_as_object(
        self,
        name: ir_types.DeclaredTypeName,
        discriminant_field_name: ir_types.NameAndWireValue,
        wire_discriminant_value: ir_types.NameAndWireValue,
        example: Union[ir_types.ExampleObjectTypeWithTypeId, AST.Expression],
    ) -> AST.Expression:
        if isinstance(example, ir_types.ExampleObjectTypeWithTypeId):
            return FernTypedDict.type_to_snippet(
                example=example.object,
                additional_properties=[
                    SimpleObjectProperty(
                        name=discriminant_field_name.name.snake_case.safe_name,
                        value=FernTypedDict.wrap_string_as_example(wire_discriminant_value.wire_value),
                    )
                ],
                snippet_writer=self.snippet_writer,
            )
        else:

            def write_dict(writer: AST.NodeWriter) -> None:
                writer.write("{")
                writer.write_node(example)  # type: ignore # mypy still thinks this could be an ExampleObjectTypeWithTypeId
                writer.write("}")

            return AST.Expression(AST.CodeWriter(write_dict))

    def _get_snippet_for_union_with_single_property(
        self,
        name: ir_types.DeclaredTypeName,
        discriminant_field_name: ir_types.NameAndWireValue,
        wire_discriminant_value: ir_types.NameAndWireValue,
        example: Union[ir_types.ExampleTypeReference, AST.Expression],
    ) -> AST.Expression:
        if isinstance(example, ir_types.ExampleTypeReference):
            return FernTypedDict.snippet_from_properties(
                example_properties=[
                    SimpleObjectProperty(
                        name="value",
                        value=example,
                    ),
                    SimpleObjectProperty(
                        name=discriminant_field_name.name.snake_case.safe_name,
                        value=FernTypedDict.wrap_string_as_example(wire_discriminant_value.wire_value),
                    ),
                ],
                snippet_writer=self.snippet_writer,
            )
        else:

            def write_dict(writer: AST.NodeWriter) -> None:
                writer.write("{")
                writer.write_node(example)  # type: ignore # mypy still thinks this could be an ExampleTypeReference
                writer.write("}")

            return AST.Expression(AST.CodeWriter(write_dict))

    def _get_snippet_for_union_with_no_properties(
        self,
        name: ir_types.DeclaredTypeName,
        discriminant_field_name: ir_types.NameAndWireValue,
        wire_discriminant_value: ir_types.NameAndWireValue,
    ) -> AST.Expression:
        return FernTypedDict.snippet_from_properties(
            example_properties=[
                SimpleObjectProperty(
                    name=discriminant_field_name.name.snake_case.safe_name,
                    value=FernTypedDict.wrap_string_as_example(wire_discriminant_value.wire_value),
                )
            ],
            snippet_writer=self.snippet_writer,
        )
