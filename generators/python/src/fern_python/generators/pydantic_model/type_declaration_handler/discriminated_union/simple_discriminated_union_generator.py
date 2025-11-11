from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional, Set, Union

import fern.ir.resources as ir_types
from ....context.pydantic_generator_context import PydanticGeneratorContext
from ...custom_config import PydanticModelCustomConfig, UnionNamingVersions
from ..abc.abstract_type_generator import AbstractTypeGenerator

from fern_python.codegen import AST, LocalClassReference, SourceFile
from fern_python.codegen.ast.references.class_reference import ClassReference
from fern_python.generators.pydantic_model.type_declaration_handler.abc.abstract_type_snippet_generator import (
    AbstractTypeSnippetGenerator,
)
from fern_python.pydantic_codegen import PydanticField
from fern_python.pydantic_codegen.pydantic_field import FernAwarePydanticField
from fern_python.snippet import SnippetWriter


@dataclass(frozen=True)
class CommonField(PydanticField):
    type_reference: Optional[ir_types.TypeReference] = None


class AbstractSimpleDiscriminatedUnionGenerator(AbstractTypeGenerator, ABC):
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
        should_generate: bool = True,
    ):
        super().__init__(
            context=context,
            custom_config=custom_config,
            source_file=source_file,
            docs=docs,
            snippet=snippet,
        )
        self._context = context
        self._name = name
        self._union = union
        self._extended_types = self._get_all_extended_types()
        self._property_type_ids = self._get_direct_references_for_union()
        self._should_generate = should_generate

        self._all_referenced_types: List[ir_types.TypeReference] = []

        # Union base class
        self._should_generate_base_class = False
        self._base_class_name = AbstractSimpleDiscriminatedUnionGenerator.BASE_CLASS_NAME
        self._base_class_properties: List[FernAwarePydanticField] = []
        self._class_reference_for_base: Optional[ClassReference] = None

    def generate(self) -> None:
        self._get_base_class_details()
        self._generate_base_class()

        single_union_type_references: List[LocalClassReference] = []

        for single_union_type in self._union.types:
            shape = single_union_type.shape.get_as_union()
            discriminant_value = self._get_discriminant_value_for_single_union_type(single_union_type)
            member_class_name = self._generate_member_name(single_union_type)

            if shape.properties_type == "singleProperty":
                self._all_referenced_types.append(shape.type)
                is_type_circular_reference = self._context.does_type_reference_reference_other_type(
                    shape.type, self._name.type_id
                )

                single_property_property_fields: List[PydanticField] = [
                    PydanticField(
                        name=shape.name.name.snake_case.safe_name,
                        pascal_case_field_name=shape.name.name.pascal_case.safe_name,
                        json_field_name=shape.name.wire_value,
                        type_hint=self._context.get_type_hint_for_type_reference(
                            type_reference=shape.type,
                            must_import_after_current_declaration=lambda _: is_type_circular_reference,
                        ),
                    ),
                    PydanticField(
                        name=get_discriminant_parameter_name(self._union.discriminant),
                        pascal_case_field_name=self._union.discriminant.name.pascal_case.safe_name,
                        type_hint=AST.TypeHint.literal(discriminant_value),
                        json_field_name=self._union.discriminant.wire_value,
                        default_value=discriminant_value,
                    ),
                ]

                single_property_property_fern_aware_fields: List[FernAwarePydanticField] = [
                    FernAwarePydanticField(
                        name=shape.name.name.snake_case.safe_name,
                        pascal_case_field_name=shape.name.name.pascal_case.safe_name,
                        json_field_name=shape.name.wire_value,
                        type_reference=shape.type,
                    ),
                    FernAwarePydanticField(
                        name=get_discriminant_parameter_name(self._union.discriminant),
                        pascal_case_field_name=self._union.discriminant.name.pascal_case.safe_name,
                        json_field_name=self._union.discriminant.wire_value,
                        default_value=discriminant_value,
                        type_reference=ir_types.TypeReference.factory.container(
                            ir_types.ContainerType.factory.literal(
                                ir_types.Literal.factory.string(single_union_type.discriminant_value.wire_value)
                            )
                        ),
                    ),
                ]
                single_union_type_references.append(
                    self._generate_single_property_member(
                        single_union_type=single_union_type,
                        class_name=member_class_name,
                        properties=single_property_property_fields,
                        fern_aware_properties=single_property_property_fern_aware_fields,
                    )
                )

            elif shape.properties_type == "samePropertiesAsObject":
                same_properties_as_object_property_fields: List[FernAwarePydanticField] = [
                    FernAwarePydanticField(
                        name=get_discriminant_parameter_name(self._union.discriminant),
                        pascal_case_field_name=self._union.discriminant.name.pascal_case.safe_name,
                        type_reference=ir_types.TypeReference.factory.container(
                            ir_types.ContainerType.factory.literal(
                                ir_types.Literal.factory.string(single_union_type.discriminant_value.wire_value)
                            )
                        ),
                        json_field_name=self._union.discriminant.wire_value,
                        default_value=discriminant_value,
                    )
                ]
                object_properties = self._context.get_all_properties_including_extensions(shape.type_id)
                for object_property in object_properties:
                    self._all_referenced_types.append(object_property.value_type)
                    same_properties_as_object_property_fields.append(
                        FernAwarePydanticField(
                            name=object_property.name.name.snake_case.safe_name,
                            pascal_case_field_name=object_property.name.name.pascal_case.safe_name,
                            json_field_name=object_property.name.wire_value,
                            type_reference=object_property.value_type,
                        )
                    )

                single_union_type_references.append(
                    self._generate_same_properties_as_object_member(
                        member_type_id=shape.type_id,
                        class_name=member_class_name,
                        properties=same_properties_as_object_property_fields,
                    )
                )

            elif shape.properties_type == "noProperties":
                no_properties_property_field = FernAwarePydanticField(
                    name=get_discriminant_parameter_name(self._union.discriminant),
                    pascal_case_field_name=self._union.discriminant.name.pascal_case.safe_name,
                    type_reference=ir_types.TypeReference.factory.container(
                        ir_types.ContainerType.factory.literal(
                            ir_types.Literal.factory.string(single_union_type.discriminant_value.wire_value)
                        )
                    ),
                    json_field_name=self._union.discriminant.wire_value,
                    default_value=discriminant_value,
                )

                single_union_type_references.append(
                    self._generate_no_property_member(
                        class_name=member_class_name, discriminant_field=no_properties_property_field
                    )
                )

        type_hint = (
            AST.TypeHint.union(*(AST.TypeHint(ref) for ref in single_union_type_references))
            if len(single_union_type_references) > 1
            else AST.TypeHint(single_union_type_references[0])
        )

        type_hint = self._maybe_wrap_type_hint(type_hint)

        union_class_name = self._generate_union_class_name()
        type_alias_declaration = AST.TypeAliasDeclaration(
            type_hint=type_hint,
            name=union_class_name,
            snippet=self._snippet,
        )

        self._source_file.add_declaration(
            type_alias_declaration,
            should_export=True,
        )

        self._finish(type_alias_declaration)

    @abstractmethod
    def _generate_union_class_name(self) -> str: ...

    @abstractmethod
    def _generate_member_name(self, single_union_type: ir_types.SingleUnionType) -> str: ...

    @abstractmethod
    def _generate_single_property_member(
        self,
        class_name: str,
        single_union_type: ir_types.SingleUnionType,
        properties: List[PydanticField],
        fern_aware_properties: List[FernAwarePydanticField],
    ) -> LocalClassReference: ...

    @abstractmethod
    def _generate_same_properties_as_object_member(
        self, member_type_id: ir_types.TypeId, class_name: str, properties: List[FernAwarePydanticField]
    ) -> LocalClassReference: ...

    @abstractmethod
    def _generate_no_property_member(
        self, class_name: str, discriminant_field: FernAwarePydanticField
    ) -> LocalClassReference: ...

    @abstractmethod
    def _generate_base_class(self) -> None: ...

    @abstractmethod
    def _maybe_wrap_type_hint(self, type_hint: AST.TypeHint) -> AST.TypeHint: ...

    @abstractmethod
    def _finish(self, type_alias_declaration: AST.TypeAliasDeclaration) -> None: ...

    def _get_type_id(self, tr: ir_types.TypeReference) -> List[Union[ir_types.TypeId, None]]:
        union = tr.get_as_union()
        if union.type == "named":
            return [union.type_id]
        elif union.type == "container":
            return union.container.visit(
                list_=lambda lt: self._get_type_id(lt),
                map_=lambda mt: self._get_type_id(mt.key_type) + self._get_type_id(mt.value_type),
                optional=lambda ot: self._get_type_id(ot),
                nullable=lambda nt: self._get_type_id(nt),
                set_=lambda st: self._get_type_id(st),
                literal=lambda _: [],
            )
        return []

    def _get_all_extended_types(self) -> Set[ir_types.TypeId]:
        extended_types = set()
        for single_union_type in self._union.types:
            shape = single_union_type.shape.get_as_union()
            if shape.properties_type == "samePropertiesAsObject":
                extended_types.add(shape.type_id)
        return extended_types

    def _get_direct_references_for_union(self) -> Set[ir_types.TypeId]:
        property_references = []
        for single_union_type in self._union.types:
            shape = single_union_type.shape.get_as_union()
            if shape.properties_type == "samePropertiesAsObject":
                type_ids = list(
                    map(lambda p: p.value_type, self._context.get_all_properties_including_extensions(shape.type_id))
                )

                property_references += type_ids

        property_type_ids = set()
        for tr in property_references:
            for ti in self._get_type_id(tr):
                if ti is not None:
                    property_type_ids.add(ti)

        return property_type_ids

    def _get_discriminant_value_for_single_union_type(
        self,
        single_union_type: ir_types.SingleUnionType,
    ) -> AST.Expression:
        return AST.Expression(f'"{single_union_type.discriminant_value.wire_value}"')

    def _get_base_class_details(self) -> None:
        if len(self._union.base_properties) > 0:
            self._should_generate_base_class = True
            is_base_class_name_present = False
            for single_union_type in self._union.types:
                type_union = single_union_type.shape.get_as_union()
                if (
                    type_union.properties_type == "samePropertiesAsObject"
                    and type_union.name.pascal_case.safe_name
                    == AbstractSimpleDiscriminatedUnionGenerator.BASE_CLASS_NAME
                ):
                    is_base_class_name_present = True

            self._base_class_name = (
                AbstractSimpleDiscriminatedUnionGenerator.BASE_CLASS_NAME_WITH_UNDERSCORE
                if is_base_class_name_present
                else AbstractSimpleDiscriminatedUnionGenerator.BASE_CLASS_NAME
            )

            self._class_reference_for_base = ClassReference(
                qualified_name_excluding_import=(self._base_class_name,),
            )

            for property in self._union.base_properties:
                self._base_class_properties.append(
                    FernAwarePydanticField(
                        name=property.name.name.snake_case.safe_name,
                        pascal_case_field_name=property.name.name.pascal_case.safe_name,
                        type_reference=property.value_type,
                        json_field_name=property.name.wire_value,
                        description=property.docs,
                    )
                )
                self._all_referenced_types.append(property.value_type)


class AbstractDiscriminatedUnionSnippetGenerator(AbstractTypeSnippetGenerator, ABC):
    def __init__(
        self,
        snippet_writer: SnippetWriter,
        name: ir_types.DeclaredTypeName,
        example: Optional[ir_types.ExampleUnionType],
        use_typeddict_request: bool,
        as_request: bool,
        union_naming_version: UnionNamingVersions,
        example_expression: Optional[AST.Expression] = None,
        single_union_type: Optional[ir_types.SingleUnionType] = None,
    ):
        super().__init__(
            snippet_writer=snippet_writer,
        )

        self.name = name
        self.example = example
        self.example_expression = example_expression
        self.sut = single_union_type
        self.as_request = as_request
        self.use_typeddict_request = use_typeddict_request
        self.union_naming_version: UnionNamingVersions = union_naming_version

    def generate_snippet_template(self) -> Union[AST.Expression, None]:
        sut = self.sut
        ex = self.example_expression
        if sut is None or ex is None:
            raise ValueError("Example must be be present to generate snippet.")
        else:
            return sut.shape.visit(
                same_properties_as_object=lambda _: self._get_snippet_for_union_with_same_properties_as_object(
                    name=self.name,
                    discriminant_field_name=sut.discriminant_value,  # type: ignore
                    wire_discriminant_value=sut.discriminant_value,  # type: ignore
                    example=ex,  # type: ignore
                ),
                single_property=lambda _: self._get_snippet_for_union_with_single_property(
                    name=self.name,
                    discriminant_field_name=sut.discriminant_value,  # type: ignore
                    wire_discriminant_value=sut.discriminant_value,  # type: ignore
                    example=ex,  # type: ignore
                ),
                no_properties=lambda: self._get_snippet_for_union_with_no_properties(
                    name=self.name,
                    discriminant_field_name=sut.discriminant_value,  # type: ignore
                    wire_discriminant_value=sut.discriminant_value,  # type: ignore
                ),
            )

    def generate_snippet(self) -> AST.Expression:
        ex = self.example
        if ex is None:
            raise ValueError("Example must be be present to generate snippet.")
        else:
            return ex.single_union_type.shape.visit(
                same_properties_as_object=lambda object: self._get_snippet_for_union_with_same_properties_as_object(
                    name=self.name,
                    discriminant_field_name=ex.discriminant,  # type: ignore
                    wire_discriminant_value=ex.single_union_type.wire_discriminant_value,  # type: ignore
                    example=object,
                ),
                single_property=lambda example_type_reference: self._get_snippet_for_union_with_single_property(
                    name=self.name,
                    discriminant_field_name=ex.discriminant,  # type: ignore
                    wire_discriminant_value=ex.single_union_type.wire_discriminant_value,  # type: ignore
                    example=example_type_reference,
                ),
                no_properties=lambda: self._get_snippet_for_union_with_no_properties(
                    name=self.name,
                    discriminant_field_name=ex.discriminant,  # type: ignore
                    wire_discriminant_value=ex.single_union_type.wire_discriminant_value,  # type: ignore
                ),
            )

    @abstractmethod
    def _get_snippet_for_union_with_same_properties_as_object(
        self,
        name: ir_types.DeclaredTypeName,
        discriminant_field_name: ir_types.NameAndWireValue,
        wire_discriminant_value: ir_types.NameAndWireValue,
        example: Union[ir_types.ExampleObjectTypeWithTypeId, AST.Expression],
    ) -> AST.Expression: ...

    @abstractmethod
    def _get_snippet_for_union_with_single_property(
        self,
        name: ir_types.DeclaredTypeName,
        discriminant_field_name: ir_types.NameAndWireValue,
        wire_discriminant_value: ir_types.NameAndWireValue,
        example: Union[ir_types.ExampleTypeReference, AST.Expression],
    ) -> AST.Expression: ...

    @abstractmethod
    def _get_snippet_for_union_with_no_properties(
        self,
        name: ir_types.DeclaredTypeName,
        discriminant_field_name: ir_types.NameAndWireValue,
        wire_discriminant_value: ir_types.NameAndWireValue,
    ) -> AST.Expression: ...

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
                        name=name, as_request=self.as_request
                    ),
                ),
                named_import=get_single_union_type_class_name(
                    name=name,
                    wire_discriminant_value=wire_discriminant_value,
                    union_naming_version=self.union_naming_version,
                ),
            ),
        )


# TODO: For V1 naming, we should take into account if the new name introduces a conflict with an existing class name
def get_single_union_type_class_name(
    name: ir_types.DeclaredTypeName,
    wire_discriminant_value: ir_types.NameAndWireValue,
    union_naming_version: UnionNamingVersions,
) -> str:
    wire_value = wire_discriminant_value.name.pascal_case.unsafe_name
    union_name = get_union_class_name(name)
    return f"{union_name}_{wire_value}" if union_naming_version == "v0" else f"{wire_value}{union_name}"


def get_union_class_name(name: ir_types.DeclaredTypeName) -> str:
    return name.name.pascal_case.safe_name


def get_discriminant_parameter_name(discriminant: ir_types.NameAndWireValue) -> str:
    return discriminant.name.snake_case.safe_name


def get_field_name_for_single_property(property: ir_types.SingleUnionTypeProperty) -> str:
    return property.name.name.snake_case.safe_name
