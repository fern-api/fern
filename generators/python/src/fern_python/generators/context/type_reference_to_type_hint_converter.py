from typing import Callable, Optional, cast

from .pydantic_generator_context import PydanticGeneratorContext
from fern_python.codegen import AST
from fern_python.declaration_referencer import AbstractDeclarationReferencer

import fern.ir.resources as ir_types


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
        as_if_type_checking_import: bool = False,
        in_endpoint: Optional[bool] = False,
        for_typeddict: bool = False,
    ) -> AST.TypeHint:
        return type_reference.visit(
            container=lambda container: self._get_type_hint_for_container(
                container=container,
                must_import_after_current_declaration=must_import_after_current_declaration,
                in_endpoint=in_endpoint,
                as_if_type_checking_import=as_if_type_checking_import,
                for_typeddict=for_typeddict,
            ),
            named=lambda type_name: self._get_type_hint_for_named(
                type_name=cast(ir_types.DeclaredTypeName, type_name),
                must_import_after_current_declaration=must_import_after_current_declaration,
                as_request=in_endpoint if in_endpoint is not None else False,
                as_if_type_checking_import=as_if_type_checking_import,
            ),
            primitive=self._get_type_hint_for_primitive,
            unknown=lambda: AST.TypeHint.any(),
        )

    def _get_set_type_hint_for_named(
        self,
        name: ir_types.DeclaredTypeName,
        must_import_after_current_declaration: Optional[Callable[[ir_types.DeclaredTypeName], bool]],
        in_endpoint: Optional[bool],
        as_if_type_checking_import: bool = False,
    ) -> AST.TypeHint:
        is_primitive = self._context.get_declaration_for_type_id(name.type_id).shape.visit(
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
            as_request=in_endpoint if in_endpoint is not None else False,
            as_if_type_checking_import=as_if_type_checking_import,
        )
        if is_primitive:
            return AST.TypeHint.set(inner_hint)
        if in_endpoint:
            return AST.TypeHint.sequence(inner_hint)
        return AST.TypeHint.list(inner_hint)

    def _get_type_hint_for_container(
        self,
        container: ir_types.ContainerType,
        must_import_after_current_declaration: Optional[Callable[[ir_types.DeclaredTypeName], bool]],
        in_endpoint: Optional[bool],
        as_if_type_checking_import: bool = False,
        for_typeddict: bool = False,
    ) -> AST.TypeHint:
        return container.visit(
            list_=lambda wrapped_type: AST.TypeHint.sequence(
                self.get_type_hint_for_type_reference(
                    type_reference=wrapped_type,
                    must_import_after_current_declaration=must_import_after_current_declaration,
                    as_if_type_checking_import=as_if_type_checking_import,
                    in_endpoint=in_endpoint,
                    for_typeddict=False,
                )
            )
            if in_endpoint
            else AST.TypeHint.list(
                self.get_type_hint_for_type_reference(
                    type_reference=wrapped_type,
                    must_import_after_current_declaration=must_import_after_current_declaration,
                    as_if_type_checking_import=as_if_type_checking_import,
                    in_endpoint=in_endpoint,
                    for_typeddict=False,
                )
            ),
            map_=lambda map_type: AST.TypeHint.dict(
                key_type=self.get_type_hint_for_type_reference(
                    type_reference=map_type.key_type,
                    must_import_after_current_declaration=must_import_after_current_declaration,
                    as_if_type_checking_import=as_if_type_checking_import,
                    in_endpoint=in_endpoint,
                    for_typeddict=False,
                ),
                value_type=self.get_type_hint_for_type_reference(
                    type_reference=map_type.value_type,
                    must_import_after_current_declaration=must_import_after_current_declaration,
                    as_if_type_checking_import=as_if_type_checking_import,
                    in_endpoint=in_endpoint,
                    for_typeddict=False,
                ),
            ),
            # Fern sets become Pydanic lists, since Pydantic models aren't hashable
            set_=lambda wrapped_type: wrapped_type.visit(
                container=lambda type_reference: AST.TypeHint.sequence(
                    self._get_type_hint_for_container(
                        container=type_reference,
                        must_import_after_current_declaration=must_import_after_current_declaration,
                        as_if_type_checking_import=as_if_type_checking_import,
                        in_endpoint=in_endpoint,
                        for_typeddict=False,
                    )
                )
                if in_endpoint
                else AST.TypeHint.list(
                    self._get_type_hint_for_container(
                        container=type_reference,
                        must_import_after_current_declaration=must_import_after_current_declaration,
                        as_if_type_checking_import=as_if_type_checking_import,
                        in_endpoint=in_endpoint,
                        for_typeddict=False,
                    )
                ),
                named=lambda type_reference: self._get_set_type_hint_for_named(
                    cast(ir_types.DeclaredTypeName, type_reference),
                    must_import_after_current_declaration=must_import_after_current_declaration,
                    as_if_type_checking_import=as_if_type_checking_import,
                    in_endpoint=in_endpoint,
                ),
                primitive=lambda type_reference: AST.TypeHint.set(
                    self._get_type_hint_for_primitive(primitive=type_reference)
                ),
                unknown=lambda: AST.TypeHint.list(AST.TypeHint.any()),
            ),
            nullable=lambda wrapped_type: AST.TypeHint.optional(
                self.get_type_hint_for_type_reference(
                    type_reference=self._unbox_type_reference(wrapped_type),
                    must_import_after_current_declaration=must_import_after_current_declaration,
                    as_if_type_checking_import=as_if_type_checking_import,
                    in_endpoint=in_endpoint,
                    for_typeddict=for_typeddict,
                )
            ),
            optional=lambda wrapped_type: AST.TypeHint.optional(
                self.get_type_hint_for_type_reference(
                    type_reference=self._unbox_type_reference(wrapped_type),
                    must_import_after_current_declaration=must_import_after_current_declaration,
                    as_if_type_checking_import=as_if_type_checking_import,
                    in_endpoint=in_endpoint,
                    for_typeddict=for_typeddict,
                )
            )
            if not for_typeddict
            else AST.TypeHint.not_required(
                self.get_type_hint_for_type_reference(
                    type_reference=wrapped_type,
                    must_import_after_current_declaration=must_import_after_current_declaration,
                    as_if_type_checking_import=as_if_type_checking_import,
                    in_endpoint=in_endpoint,
                    # As soon as we handle the top-level typing_extensions.NotRequired, we don't
                    #  want to propagate the TypedDict handling any further. The remaining nested
                    #  type references should be handled as normal.
                    for_typeddict=False,
                )
            ),
            literal=self.visit_literal,
        )

    def visit_literal(self, wrapped_type: ir_types.Literal) -> AST.TypeHint:
        def escape_string(s: str) -> str:
            # Escape all double quotes and backslashes
            escaped = s.replace("\\", "\\\\").replace('"', '\\"')
            return escaped

        value = wrapped_type.visit(
            lambda string: AST.Expression(f'"{escape_string(string)}"'),
            lambda boolean: AST.Expression(f"{boolean}"),
        )

        result = AST.TypeHint.literal(value=value)

        return result

    def _get_type_hint_for_named(
        self,
        type_name: ir_types.DeclaredTypeName,
        must_import_after_current_declaration: Optional[Callable[[ir_types.DeclaredTypeName], bool]],
        as_request: bool,
        as_if_type_checking_import: bool = False,
    ) -> AST.TypeHint:
        return AST.TypeHint(
            type=self._type_declaration_referencer.get_class_reference(
                name=type_name,
                must_import_after_current_declaration=must_import_after_current_declaration,
                as_if_type_checking_import=as_if_type_checking_import,
                as_request=as_request,
            )
        )

    def _get_type_hint_for_primitive(self, primitive: ir_types.PrimitiveType) -> AST.TypeHint:
        to_return = primitive.v_1.visit(
            integer=AST.TypeHint.int_,
            double=AST.TypeHint.float_,
            string=AST.TypeHint.str_,
            boolean=AST.TypeHint.bool_,
            long_=AST.TypeHint.int_,
            date_time=AST.TypeHint.datetime,
            uuid_=AST.TypeHint.uuid,
            date=AST.TypeHint.date,
            base_64=AST.TypeHint.str_,
            big_integer=AST.TypeHint.str_,
            uint=AST.TypeHint.int_,
            uint_64=AST.TypeHint.int_,
            float_=AST.TypeHint.float_,
        )
        return to_return

    def _unbox_type_reference(self, type_reference: ir_types.TypeReference) -> ir_types.TypeReference:
        return type_reference.visit(
            container=lambda container: self._unbox_type_reference_container(
                type_reference=type_reference,
                container=container,
            ),
            named=lambda _: type_reference,
            primitive=lambda _: type_reference,
            unknown=lambda: type_reference,
        )

    def _unbox_type_reference_container(
        self, type_reference: ir_types.TypeReference, container: ir_types.ContainerType
    ) -> ir_types.TypeReference:
        return container.visit(
            list_=lambda _: type_reference,
            map_=lambda _: type_reference,
            set_=lambda _: type_reference,
            nullable=lambda nullable: self._unbox_type_reference(type_reference=nullable),
            optional=lambda optional: self._unbox_type_reference(type_reference=optional),
            literal=lambda _: type_reference,
        )
