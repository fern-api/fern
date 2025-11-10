from __future__ import annotations

from dataclasses import dataclass
from types import TracebackType
from typing import Dict, List, Optional, Sequence, Type, TYPE_CHECKING

from ..context.pydantic_generator_context import PydanticGeneratorContext
from fern_python.codegen import AST, SourceFile
from fern_python.codegen.ast.references.class_reference import ClassReference
from fern_python.codegen.local_class_reference import LocalClassReference
from fern_python.external_dependencies.typing_extensions import (
    TYPING_EXTENSIONS_DEPENDENCY,
)
from fern_python.generators.pydantic_model.model_utilities import can_be_fern_model
from fern_python.snippet.snippet_writer import SnippetWriter

import fern.ir.resources as ir_types

if TYPE_CHECKING:
    from fern_python.snippet.recursion_guard import RecursionGuard

TYPING_EXTENSIONS_MODULE = AST.Module.external(
    module_path=("typing_extensions",),
    dependency=TYPING_EXTENSIONS_DEPENDENCY,
)


@dataclass(frozen=True)
class SimpleObjectProperty:
    name: str
    value: ir_types.ExampleTypeReference


class FernTypedDict:
    TYPEDDICT_REFERENCE = AST.ClassReference(
        qualified_name_excluding_import=("TypedDict",),
        import_=AST.ReferenceImport(module=TYPING_EXTENSIONS_MODULE),
    )

    def __init__(
        self,
        context: PydanticGeneratorContext,
        source_file: SourceFile,
        type_name: Optional[ir_types.DeclaredTypeName] = None,
        should_export: bool = True,
        extended_types: Sequence[ir_types.DeclaredTypeName] = [],
        extended_references: Optional[Sequence[ClassReference]] = None,
        class_name: Optional[str] = None,
        docstring: Optional[str] = None,
        # Since we create new classes for union members, we need to know the original type name
        # to appropriately detect circular imports.
        original_type_id: Optional[ir_types.TypeId] = None,
        # In a similar vein, we create objects for single property union members, which means that
        # the IR will not immediately contain that type to do an appropriate circular reference check
        # and so we need to know the container's type id (e.g. the type of the Union) to appropriately detect circular imports.
        container_type_id: Optional[ir_types.TypeId] = None,
    ):
        self._context = context
        self._type_name = type_name
        self._original_type_id = original_type_id
        self._container_type_id = container_type_id

        extends_crs = list((extended_references or []))
        extends_crs.extend(
            [context.get_class_reference_for_type_id(extended.type_id, as_request=True) for extended in extended_types]
        )

        for extended_type in extended_types:
            type_id_to_reference = self._type_id_for_forward_ref()
            if type_id_to_reference is not None and context.does_type_reference_other_type(
                type_id=extended_type.type_id, other_type_id=type_id_to_reference
            ):
                # While we don't want to string reference the extended model, we still want to rebuild the model
                self._model_contains_forward_refs = True
                break

        if class_name is None and type_name is None:
            raise ValueError("Either class_name or name must be provided")
        elif class_name is not None:
            self._class_name = class_name
        elif type_name is not None:
            self._class_name = self._context.get_class_name_for_type_id(type_name.type_id, as_request=True)

        self._class_declaration = AST.ClassDeclaration(
            name=self._class_name,
            extends=extends_crs or [FernTypedDict.TYPEDDICT_REFERENCE],
            docstring=AST.Docstring(docstring) if docstring is not None else None,
        )
        self._type_declaration = None
        if type_name is not None:
            self._type_declaration = context.get_declaration_for_type_id(type_name.type_id)

        self._local_class_reference = source_file.add_class_declaration(
            declaration=self._class_declaration, should_export=should_export
        )

    def to_reference(self) -> LocalClassReference:
        return self._local_class_reference

    def _type_id_for_forward_ref(self) -> Optional[ir_types.TypeId]:
        type_id_to_reference = None
        if self._type_name is not None:
            type_id_to_reference = self._type_name.type_id
        elif self._original_type_id is not None:
            type_id_to_reference = self._original_type_id
        elif self._container_type_id is not None:
            type_id_to_reference = self._container_type_id

        return type_id_to_reference

    def _field_type_is_circularly_referenced(self, field_types: List[ir_types.TypeId]) -> bool:
        type_id_to_reference = self._type_id_for_forward_ref()

        return (
            any(
                [
                    self._context.does_type_reference_other_type(type_id=field_type, other_type_id=type_id_to_reference)
                    for field_type in field_types
                ]
            )
            if type_id_to_reference is not None
            else False
        )

    def _get_type_hint_for_type_reference(
        self, type_reference: ir_types.TypeReference, as_if_type_checking_import: bool
    ) -> AST.TypeHint:
        return self._context.get_type_hint_for_type_reference(
            type_reference,
            as_if_type_checking_import=as_if_type_checking_import,
            in_endpoint=True,
            for_typeddict=True,
        )

    def add_field(
        self,
        *,
        name: str,
        json_field_name: str,
        type_reference: ir_types.TypeReference,
        description: Optional[str] = None,
        # Here to mirror the FernAwarePydanticModel.add_field method signature
        # which makes it easy to spread args from that method to this one.
        pascal_case_field_name: Optional[str] = None,
        default_value: Optional[AST.Expression] = None,
    ) -> None:
        maybe_type_id = self._context.maybe_get_type_ids_for_type_reference(type_reference)
        as_if_type_checking = False
        if maybe_type_id is not None and self._field_type_is_circularly_referenced(maybe_type_id):
            # Mark the class reference as if_typechecking since we have a circular ref that we'll
            # need to string reference and import through `if TYPE_CHECKING`.
            as_if_type_checking = True

        is_optional = False
        type_reference_unioned = type_reference.get_as_union()
        # For TypedDicts, the NotRequired typehint has to surround the potential
        # Annotation typehint, so we need to unwrap the optional container if it exists first.
        if type_reference_unioned.type == "container":
            container_reference_unioned = type_reference_unioned.container.get_as_union()
            if container_reference_unioned.type == "optional":
                type_reference = container_reference_unioned.optional
                is_optional = True

        type_hint = self._get_type_hint_for_type_reference(type_reference, as_if_type_checking)
        if json_field_name != name:
            field_metadata = self._context.core_utilities.get_field_metadata().get_instance()
            field_metadata.add_alias(json_field_name)

            type_hint = AST.TypeHint.annotated(
                type=type_hint,
                annotation=field_metadata.get_as_node(),
            )
        if is_optional:
            type_hint = AST.TypeHint.not_required(type_hint)

        self._class_declaration.add_class_var(
            AST.VariableDeclaration(
                name=name,
                type_hint=type_hint,
                docstring=AST.Docstring(description) if description is not None else None,
            )
        )

    def finish(self) -> None:
        return

    def __enter__(self) -> FernTypedDict:
        return self

    def __exit__(
        self,
        exctype: Optional[Type[BaseException]],
        excinst: Optional[BaseException],
        exctb: Optional[TracebackType],
    ) -> None:
        self.finish()

    @classmethod
    def wrap_string_as_example(cls, string: str) -> ir_types.ExampleTypeReference:
        return ir_types.ExampleTypeReference(
            shape=ir_types.ExampleTypeReferenceShape.factory.primitive(
                ir_types.ExamplePrimitive.factory.string(ir_types.EscapedString(original=string))
            ),
            json_example=string,
        )

    @classmethod
    def snippet_from_properties(
        cls, example_properties: List[SimpleObjectProperty], snippet_writer: SnippetWriter, recursion_guard: Optional["RecursionGuard"] = None
    ) -> AST.Expression:
        example_dict_pairs: List[ir_types.ExampleKeyValuePair] = []
        for property in example_properties:
            example_dict_pairs.append(
                ir_types.ExampleKeyValuePair(
                    key=ir_types.ExampleTypeReference(
                        shape=ir_types.ExampleTypeReferenceShape.factory.primitive(
                            ir_types.ExamplePrimitive.factory.string(ir_types.EscapedString(original=property.name))
                        ),
                        json_example=property.name,
                    ),
                    value=property.value,
                )
            )
        return snippet_writer._get_snippet_for_map(
            example_dict_pairs, use_typeddict_request=True, as_request=True, in_typeddict=True, recursion_guard=recursion_guard
        )

    @classmethod
    def type_to_snippet(
        cls,
        example: ir_types.ExampleObjectType,
        snippet_writer: SnippetWriter,
        additional_properties: List[SimpleObjectProperty] = [],
        recursion_guard: Optional["RecursionGuard"] = None,
    ) -> AST.Expression:
        example_properties = [
            SimpleObjectProperty(
                name=property.name.name.snake_case.safe_name,
                value=property.value,
            )
            for property in example.properties
        ]
        example_properties.extend(additional_properties)
        return cls.snippet_from_properties(
            example_properties=example_properties,
            snippet_writer=snippet_writer,
            recursion_guard=recursion_guard,
        )

    @classmethod
    def can_type_id_be_typeddict(
        cls, type_id: ir_types.TypeId, types: Dict[ir_types.TypeId, ir_types.TypeDeclaration]
    ) -> bool:
        return can_be_fern_model(types[type_id].shape, types)
