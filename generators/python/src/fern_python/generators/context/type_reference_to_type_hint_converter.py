from typing import Callable, Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST
from fern_python.declaration_referencer import AbstractDeclarationReferencer

from .pydantic_generator_context import PydanticGeneratorContext


class TypeReferenceToTypeHintConverter:
    def __init__(
        self,
        type_declaration_referencer: AbstractDeclarationReferencer[ir_types.DeclaredTypeName],
        context: PydanticGeneratorContext,
    ):
        self._context = context
        self._type_declaration_referencer = type_declaration_referencer

    def get_type_hint_for_type_reference(
        self,
        type_reference: ir_types.TypeReference,
        must_import_after_current_declaration: Optional[Callable[[ir_types.DeclaredTypeName], bool]],
        check_is_circular_reference: Optional[
            Callable[[ir_types.DeclaredTypeName, ir_types.DeclaredTypeName], bool]
        ] = None,
    ) -> AST.TypeHint:
        def must_import_after_current_declaration_inner(
            type_name: ir_types.DeclaredTypeName,
        ) -> Optional[Callable[[ir_types.DeclaredTypeName], bool]]:
            if must_import_after_current_declaration:
                return must_import_after_current_declaration
            elif check_is_circular_reference is not None:
                # This is an odd work around to get typing to accept that the function isn't none
                check_is_circular_reference_not_none: Callable[
                    [ir_types.DeclaredTypeName, ir_types.DeclaredTypeName], bool
                ] = check_is_circular_reference
                return lambda other_type_name: check_is_circular_reference_not_none(other_type_name, type_name)
            else:
                return None

        return type_reference.visit(
            container=lambda container: self._get_type_hint_for_container(
                container=container,
                must_import_after_current_declaration=must_import_after_current_declaration,
            ),
            named=lambda type_name: self._get_type_hint_for_named(
                type_name=type_name,
                must_import_after_current_declaration=must_import_after_current_declaration_inner(type_name),
            ),
            primitive=self._get_type_hint_for_primitive,
            unknown=AST.TypeHint.any,
        )

    def _get_set_type_hint_for_named(
        self,
        name: ir_types.DeclaredTypeName,
        must_import_after_current_declaration: Optional[Callable[[ir_types.DeclaredTypeName], bool]],
    ) -> AST.TypeHint:
        is_primative = self._context.get_declaration_for_type_id(name.type_id).shape.visit(
            alias=lambda alias_td: alias_td.resolved_type.visit(
                container=lambda c: False, named=lambda n: False, primitive=lambda p: True, unknown=lambda: False
            ),
            enum=lambda enum_td: True,
            object=lambda object_td: False,
            union=lambda union_td: False,
            undiscriminated_union=lambda union_td: False,
        )
        inner_hint = self._get_type_hint_for_named(
            type_name=name,
            must_import_after_current_declaration=must_import_after_current_declaration,
        )
        if is_primative:
            return AST.TypeHint.set(inner_hint)
        return AST.TypeHint.list(inner_hint)

    def _get_type_hint_for_container(
        self,
        container: ir_types.ContainerType,
        must_import_after_current_declaration: Optional[Callable[[ir_types.DeclaredTypeName], bool]],
    ) -> AST.TypeHint:
        return container.visit(
            list=lambda wrapped_type: AST.TypeHint.list(
                self.get_type_hint_for_type_reference(
                    type_reference=wrapped_type,
                    must_import_after_current_declaration=must_import_after_current_declaration,
                )
            ),
            map=lambda map_type: AST.TypeHint.dict(
                key_type=self.get_type_hint_for_type_reference(
                    type_reference=map_type.key_type,
                    must_import_after_current_declaration=must_import_after_current_declaration,
                ),
                value_type=self.get_type_hint_for_type_reference(
                    type_reference=map_type.value_type,
                    must_import_after_current_declaration=must_import_after_current_declaration,
                ),
            ),
            # Fern sets become Pydanic lists, since Pydantic models aren't hashable
            set=lambda wrapped_type: wrapped_type.visit(
                container=lambda type_reference: AST.TypeHint.list(
                    self._get_type_hint_for_container(
                        container=type_reference,
                        must_import_after_current_declaration=must_import_after_current_declaration,
                    )
                ),
                named=lambda type_reference: self._get_set_type_hint_for_named(
                    type_reference,
                    must_import_after_current_declaration=must_import_after_current_declaration,
                ),
                primitive=lambda type_reference: AST.TypeHint.set(
                    self._get_type_hint_for_primitive(primitive=type_reference)
                ),
                unknown=lambda: AST.TypeHint.list(AST.TypeHint.any()),
            ),
            optional=lambda wrapped_type: AST.TypeHint.optional(
                self.get_type_hint_for_type_reference(
                    type_reference=wrapped_type,
                    must_import_after_current_declaration=must_import_after_current_declaration,
                )
            ),
            literal=self.visit_literal,
        )

    def visit_literal(self, wrapped_type: ir_types.Literal) -> AST.TypeHint:
        value = wrapped_type.visit(
            lambda string: AST.Expression(f'"{string}"'),
            lambda boolean: AST.Expression(f"{boolean}"),
        )
        return AST.TypeHint.literal(value=value)

    def _get_type_hint_for_named(
        self,
        type_name: ir_types.DeclaredTypeName,
        must_import_after_current_declaration: Optional[Callable[[ir_types.DeclaredTypeName], bool]],
    ) -> AST.TypeHint:
        return AST.TypeHint(
            type=self._type_declaration_referencer.get_class_reference(
                name=type_name,
                must_import_after_current_declaration=must_import_after_current_declaration,
            ),
            is_string_reference=must_import_after_current_declaration(type_name)
            if must_import_after_current_declaration is not None
            else False,
        )

    def _get_type_hint_for_primitive(self, primitive: ir_types.PrimitiveType) -> AST.TypeHint:
        to_return = primitive.visit(
            integer=AST.TypeHint.int_,
            double=AST.TypeHint.float_,
            string=AST.TypeHint.str_,
            boolean=AST.TypeHint.bool_,
            long=AST.TypeHint.int_,
            date_time=AST.TypeHint.datetime,
            uuid=AST.TypeHint.uuid,
            date=AST.TypeHint.date,
            base_64=AST.TypeHint.str_,
        )
        return to_return
