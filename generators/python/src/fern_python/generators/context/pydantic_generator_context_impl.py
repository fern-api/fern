from __future__ import annotations

from collections import defaultdict
from typing import Callable, Dict, List, Optional, Set, Tuple

from ...external_dependencies.pydantic import PydanticVersionCompatibility
from .pydantic_generator_context import PydanticGeneratorContext
from .type_reference_to_type_hint_converter import TypeReferenceToTypeHintConverter
from fern_python.codegen import AST, Filepath
from fern_python.declaration_referencer import AbstractDeclarationReferencer
from fern_python.generators.pydantic_model.custom_config import UnionNamingVersions
from fern_python.utils import get_original_name, get_wire_value
from ordered_set import OrderedSet

import fern.ir.resources as ir_types
from fern.generator_exec import GeneratorConfig


class PydanticGeneratorContextImpl(PydanticGeneratorContext):
    def __init__(
        self,
        ir: ir_types.IntermediateRepresentation,
        type_declaration_referencer: AbstractDeclarationReferencer[ir_types.DeclaredTypeName],
        generator_config: GeneratorConfig,
        project_module_path: AST.ModulePath,
        allow_skipping_validation: bool,
        allow_leveraging_defaults: str,
        use_typeddict_requests: bool,
        use_str_enums: bool,
        skip_formatting: bool,
        union_naming_version: UnionNamingVersions,
        use_pydantic_field_aliases: bool,
        pydantic_compatibility: PydanticVersionCompatibility,
        reserved_names: Optional[Set[str]] = None,
        inline_undiscriminated_union_request_params: bool = False,
    ):
        super().__init__(
            ir=ir,
            generator_config=generator_config,
            allow_skipping_validation=allow_skipping_validation,
            use_typeddict_requests=use_typeddict_requests,
            type_declaration_referencer=type_declaration_referencer,
            use_str_enums=use_str_enums,
            skip_formatting=skip_formatting,
            union_naming_version=union_naming_version,
            use_pydantic_field_aliases=use_pydantic_field_aliases,
            pydantic_compatibility=pydantic_compatibility,
            inline_undiscriminated_union_request_params=inline_undiscriminated_union_request_params,
        )
        self._type_reference_to_type_hint_converter = TypeReferenceToTypeHintConverter(
            type_declaration_referencer=type_declaration_referencer, context=self
        )
        self._type_declaration_referencer = type_declaration_referencer
        self._project_module_path = project_module_path
        self._allow_leveraging_defaults = allow_leveraging_defaults
        self._reserved_names: Set[str] = reserved_names or set()

        self._types_with_non_union_self_referencing_dependencies: Dict[ir_types.TypeId, OrderedSet[ir_types.TypeId]] = (
            defaultdict(OrderedSet)
        )

        # Lazily-computed set of enum type ids that are referenced exclusively as members of
        # undiscriminated unions and are therefore inlined into those unions (and not emitted
        # as their own files). Only populated when the inlining flag is enabled.
        self._inline_eligible_enum_ids: Optional[Set[ir_types.TypeId]] = None

        for id, type in self.ir.types.items():
            ordered_reference_types = OrderedSet(list(sorted(type.referenced_types)))
            for referenced_id in ordered_reference_types:
                referenced_type = self.ir.types[referenced_id]
                referenced_type_shape = referenced_type.shape.get_as_union()
                if referenced_type_shape.type != "union" and referenced_type_shape.type != "undiscriminatedUnion":
                    # This referenced type is self-referential
                    if referenced_id in referenced_type.referenced_types:
                        self._types_with_non_union_self_referencing_dependencies[id].add(referenced_id)

    def get_module_path_in_project(self, module_path: AST.ModulePath) -> AST.ModulePath:
        return self._project_module_path + module_path

    def get_type_hint_for_type_reference(
        self,
        type_reference: ir_types.TypeReference,
        must_import_after_current_declaration: Optional[Callable[[ir_types.DeclaredTypeName], bool]] = None,
        as_if_type_checking_import: bool = False,
        in_endpoint: Optional[bool] = False,
        for_typeddict: bool = False,
    ) -> AST.TypeHint:
        return self._type_reference_to_type_hint_converter.get_type_hint_for_type_reference(
            type_reference,
            must_import_after_current_declaration=must_import_after_current_declaration,
            as_if_type_checking_import=as_if_type_checking_import,
            in_endpoint=in_endpoint,
            for_typeddict=for_typeddict,
        )

    def get_initializer_for_type_reference(
        self,
        type_reference: ir_types.TypeReference,
        ignore_literals: bool = False,
        *,
        for_request_param: bool = False,
    ) -> Optional[AST.Expression]:
        default_value = None
        union = type_reference.get_as_union()

        # Apply primitive defaults based on the use_request_defaults mode:
        # - "all": apply everywhere (query params, body params, pydantic model fields)
        # - "parameters": only for endpoint query params and headers
        # - "none": never apply
        should_apply_defaults = self._allow_leveraging_defaults == "all" or (
            self._allow_leveraging_defaults == "parameters" and for_request_param
        )
        if union.type == "primitive" and should_apply_defaults:
            maybe_v2_scheme = union.primitive.v_2
            if maybe_v2_scheme is not None:
                default_value = maybe_v2_scheme.visit(
                    integer=lambda it: AST.Expression(f"{it.default}") if it.default is not None else None,
                    double=lambda dt: AST.Expression(f"{dt.default}") if dt.default is not None else None,
                    string=lambda st: AST.Expression(repr(st.default)) if st.default is not None else None,
                    boolean=lambda bt: AST.Expression(f"{bt.default}") if bt.default is not None else None,
                    long_=lambda lt: AST.Expression(f"{lt.default}") if lt.default is not None else None,
                    big_integer=lambda bit: AST.Expression(repr(bit.default)) if bit.default is not None else None,
                    uint=lambda _: None,
                    uint_64=lambda _: None,
                    date=lambda _: None,
                    date_time=lambda _: None,
                    date_time_rfc_2822=lambda _: None,
                    uuid_=lambda _: None,
                    base_64=lambda _: None,
                    float_=lambda _: None,
                )
        elif union.type == "named":
            type_declaration = self.get_declaration_for_type_id(union.type_id)
            default_value = type_declaration.shape.visit(
                alias=lambda a: self.get_initializer_for_type_reference(
                    a.alias_of, ignore_literals=ignore_literals, for_request_param=for_request_param
                ),
                enum=lambda _: None,
                object=lambda _: None,
                union=lambda _: None,
                undiscriminated_union=lambda _: None,
            )
        elif union.type == "container":
            default_value = union.container.visit(
                literal=lambda lv: (
                    lv.visit(
                        string=lambda s: AST.Expression(f'"{s}"'),
                        boolean=lambda b: AST.Expression(f"{b}"),
                    )
                    if not ignore_literals
                    else None
                ),
                list_=lambda _: None,
                set_=lambda _: None,
                # Ignore literal defaults when the wrapping type is optional
                optional=lambda opt: self.get_initializer_for_type_reference(
                    opt, ignore_literals=True, for_request_param=for_request_param
                ),
                nullable=lambda nullable: self.get_initializer_for_type_reference(
                    nullable, ignore_literals=True, for_request_param=for_request_param
                ),
                map_=lambda _: None,
            )

        return default_value

    def get_class_reference_for_type_id(
        self,
        type_id: ir_types.TypeId,
        as_request: bool,
        must_import_after_current_declaration: Optional[Callable[[ir_types.DeclaredTypeName], bool]] = None,
        as_if_type_checking_import: bool = False,
    ) -> AST.ClassReference:
        declaration = self.ir.types[type_id]
        return self._type_declaration_referencer.get_class_reference(
            name=declaration.name,
            must_import_after_current_declaration=must_import_after_current_declaration,
            as_if_type_checking_import=as_if_type_checking_import,
            as_request=as_request,
        )

    def does_circularly_reference_itself(self, type_id: ir_types.TypeId) -> bool:
        return self.does_type_reference_other_type(type_id, type_id)

    # This map goes from every non union type to a list of referenced types that circularly reference themselves
    def get_non_union_self_referencing_dependencies_from_types(
        self,
    ) -> Dict[ir_types.TypeId, OrderedSet[ir_types.TypeId]]:
        return self._types_with_non_union_self_referencing_dependencies

    def do_types_reference_each_other(self, a: ir_types.TypeId, b: ir_types.TypeId) -> bool:
        return self.does_type_reference_other_type(a, b) and self.does_type_reference_other_type(b, a)

    def get_types_in_cycle_with(self, type_id: ir_types.TypeId) -> OrderedSet[ir_types.TypeId]:
        """
        Returns all types that are in a mutual reference cycle with the given type.
        A type B is in a cycle with type A if A references B and B references A (directly or transitively).
        """
        cycle_types: OrderedSet[ir_types.TypeId] = OrderedSet()
        referenced_types = self.get_referenced_types_ordered(type_id)
        for dep in referenced_types:
            if self.do_types_reference_each_other(type_id, dep):
                cycle_types.add(dep)
        return cycle_types

    def does_type_reference_other_type(self, type_id: ir_types.TypeId, other_type_id: ir_types.TypeId) -> bool:
        referenced_types = self.get_referenced_types(type_id)
        return other_type_id in referenced_types

    def does_type_reference_reference_other_type(
        self, type_reference: ir_types.TypeReference, other_type_id: ir_types.TypeId
    ) -> bool:
        return other_type_id in self.get_referenced_types_of_type_reference(type_reference)

    def get_referenced_types(self, type_id: ir_types.TypeId) -> Set[ir_types.TypeId]:
        declaration = self.ir.types[type_id]
        return self.get_referenced_types_of_type_declaration(declaration)

    def get_referenced_types_ordered(self, type_id: ir_types.TypeId) -> OrderedSet[ir_types.TypeId]:
        declaration = self.ir.types[type_id]
        return OrderedSet(list(sorted(self.get_referenced_types_of_type_declaration(declaration))))

    def get_declaration_for_type_id(
        self,
        type_id: ir_types.TypeId,
    ) -> ir_types.TypeDeclaration:
        return self.ir.types[type_id]

    def get_class_name_for_type_id(self, type_id: ir_types.TypeId, as_request: bool) -> str:
        declaration = self.get_declaration_for_type_id(type_id)
        name = self._type_declaration_referencer.get_class_name(name=declaration.name, as_request=as_request)
        if name in self._reserved_names:
            return f"{name}Model"
        return name

    def get_filepath_for_type_id(self, type_id: ir_types.TypeId, as_request: bool) -> Filepath:
        declaration = self.get_declaration_for_type_id(type_id)
        return self._type_declaration_referencer.get_filepath(name=declaration.name, as_request=as_request)

    def get_all_properties_including_extensions(self, type_name: ir_types.TypeId) -> List[ir_types.ObjectProperty]:
        declaration = self.get_declaration_for_type_id(type_name)
        shape = declaration.shape.get_as_union()

        if shape.type == "alias":
            resolved_type_union = shape.resolved_type.get_as_union()
            if resolved_type_union.type != "named":
                raise RuntimeError(
                    f"Cannot get properties because {get_original_name(declaration.name.name)} is not an object, it's a {shape.type}"
                )
            else:
                return self.get_all_properties_including_extensions(resolved_type_union.name.type_id)
        elif shape.type != "object":
            raise RuntimeError(
                f"Cannot get properties because {get_original_name(declaration.name.name)} is not an object, it's a {shape.type}"
            )

        properties = shape.properties.copy()
        for extension in shape.extends:
            properties.extend(self.get_all_properties_including_extensions(extension.type_id))

        return properties

    def get_referenced_types_of_type_declaration(
        self, type_declaration: ir_types.TypeDeclaration
    ) -> Set[ir_types.TypeId]:
        return type_declaration.referenced_types

    def get_referenced_types_of_type_reference(self, type_reference: ir_types.TypeReference) -> Set[ir_types.TypeId]:
        return type_reference.visit(
            container=lambda container: container.visit(
                list_=lambda item_type: self.get_referenced_types_of_type_reference(item_type),
                set_=lambda item_type: self.get_referenced_types_of_type_reference(item_type),
                optional=lambda item_type: self.get_referenced_types_of_type_reference(item_type),
                nullable=lambda item_type: self.get_referenced_types_of_type_reference(item_type),
                map_=lambda map_type: self.get_referenced_types_of_type_reference(map_type.key_type).union(
                    self.get_referenced_types_of_type_reference(map_type.value_type)
                ),
                literal=lambda literal: set(),
            ),
            primitive=lambda primitive: set(),
            named=lambda type_name: self.get_referenced_types_of_type_declaration(
                self.get_declaration_for_type_id(type_name.type_id),
            ),
            unknown=lambda: set(),
        )

    # ---------------------------------------------------------------------------
    # Inlining of literal-like undiscriminated union members
    # ---------------------------------------------------------------------------

    def _direct_named_ids(self, type_reference: ir_types.TypeReference) -> Set[ir_types.TypeId]:
        """The named type ids *directly* referenced by a type reference.

        Descends through containers (list/set/optional/nullable/map) but does NOT
        resolve named types transitively — a `named` leaf yields its own id and stops.
        This is intentionally different from `referenced_types`, which is transitive.
        """
        return type_reference.visit(
            container=lambda container: container.visit(
                list_=self._direct_named_ids,
                set_=self._direct_named_ids,
                optional=self._direct_named_ids,
                nullable=self._direct_named_ids,
                map_=lambda map_type: self._direct_named_ids(map_type.key_type)
                | self._direct_named_ids(map_type.value_type),
                literal=lambda literal: set(),
            ),
            named=lambda type_name: {type_name.type_id},
            primitive=lambda primitive: set(),
            unknown=lambda: set(),
        )

    def _is_enum_rendered_as_literals(self, type_id: ir_types.TypeId) -> bool:
        declaration = self.ir.types.get(type_id)
        if declaration is None:
            return False
        shape = declaration.shape.get_as_union()
        return shape.type == "enum" and self.use_str_enums

    def _collect_endpoint_referenced_ids(self, target: Set[ir_types.TypeId]) -> None:
        def add(type_reference: ir_types.TypeReference) -> None:
            target.update(self._direct_named_ids(type_reference))

        for header in self.ir.headers:
            add(header.value_type)
        for service in self.ir.services.values():
            for header in service.headers:
                add(header.value_type)
            for path_parameter in service.path_parameters:
                add(path_parameter.value_type)
            for endpoint in service.endpoints:
                for path_parameter in endpoint.all_path_parameters:
                    add(path_parameter.value_type)
                for query_parameter in endpoint.query_parameters:
                    add(query_parameter.value_type)
                for header in endpoint.response_headers or []:
                    add(header.value_type)
                if endpoint.request_body is not None:
                    endpoint.request_body.visit(
                        inlined_request_body=lambda body: self._add_inlined_body_refs(body, target),
                        reference=lambda reference: add(reference.request_body_type),
                        file_upload=lambda _: None,
                        bytes=lambda _: None,
                    )
                if endpoint.response is not None and endpoint.response.body is not None:
                    endpoint.response.body.visit(
                        json=lambda json_response: json_response.visit(
                            response=lambda body: add(body.response_body_type),
                            nested_property_as_response=lambda body: add(body.response_body_type),
                        ),
                        file_download=lambda _: None,
                        text=lambda _: None,
                        bytes=lambda _: None,
                        streaming=lambda _: None,
                        stream_parameter=lambda _: None,
                    )

    def _add_inlined_body_refs(self, body: ir_types.InlinedRequestBody, target: Set[ir_types.TypeId]) -> None:
        for extension in body.extends:
            target.add(extension.type_id)
        for inlined_property in body.properties:
            target.update(self._direct_named_ids(inlined_property.value_type))
        for extended_property in body.extended_properties or []:
            target.update(self._direct_named_ids(extended_property.value_type))

    def _get_inline_eligible_enum_ids(self) -> Set[ir_types.TypeId]:
        if self._inline_eligible_enum_ids is not None:
            return self._inline_eligible_enum_ids
        if not self.inline_undiscriminated_union_request_params:
            self._inline_eligible_enum_ids = set()
            return self._inline_eligible_enum_ids

        union_member_ids: Set[ir_types.TypeId] = set()
        referenced_elsewhere: Set[ir_types.TypeId] = set()

        def add_elsewhere(type_reference: ir_types.TypeReference) -> None:
            referenced_elsewhere.update(self._direct_named_ids(type_reference))

        for declaration in self.ir.types.values():
            shape = declaration.shape.get_as_union()
            if shape.type == "undiscriminatedUnion":
                for member in shape.members:
                    union_member_ids.update(self._direct_named_ids(member.type))
            elif shape.type == "object":
                for extension in shape.extends:
                    referenced_elsewhere.add(extension.type_id)
                for property in shape.properties:
                    add_elsewhere(property.value_type)
            elif shape.type == "alias":
                add_elsewhere(shape.alias_of)
            elif shape.type == "union":
                for extension in shape.extends:
                    referenced_elsewhere.add(extension.type_id)
                for base_property in shape.base_properties:
                    add_elsewhere(base_property.value_type)
                for variant in shape.types:
                    variant.shape.visit(
                        same_properties_as_object=lambda type_name: referenced_elsewhere.add(type_name.type_id),
                        single_property=lambda single_property: add_elsewhere(single_property.type),
                        no_properties=lambda: None,
                    )
            # enums reference no other types

        self._collect_endpoint_referenced_ids(referenced_elsewhere)

        self._inline_eligible_enum_ids = {
            type_id
            for type_id in union_member_ids
            if self._is_enum_rendered_as_literals(type_id) and type_id not in referenced_elsewhere
        }
        return self._inline_eligible_enum_ids

    def should_inline_away_type(self, type_id: ir_types.TypeId) -> bool:
        return type_id in self._get_inline_eligible_enum_ids()

    def _enum_value_reprs(self, type_id: ir_types.TypeId) -> List[str]:
        declaration = self.ir.types[type_id]
        enum_values = declaration.shape.visit(
            alias=lambda _: [],
            enum=lambda enum: list(enum.values),
            object=lambda _: [],
            union=lambda _: [],
            undiscriminated_union=lambda _: [],
        )
        reprs: List[str] = []
        for value in enum_values:
            escaped = get_wire_value(value.name).replace("\\", "\\\\").replace('"', '\\"')
            reprs.append(f'"{escaped}"')
        return reprs

    def _literal_value_reprs_for_member(
        self, type_reference: ir_types.TypeReference
    ) -> Optional[Tuple[List[str], bool]]:
        """If a union member is literal-like and should be inlined, returns its literal
        value reprs and whether it carries a forward-compatible fallback (enums do).
        Returns None if the member should be kept as-is.
        """
        union = type_reference.get_as_union()
        if union.type == "container":
            container = union.container.get_as_union()
            if container.type == "literal":
                literal_repr = container.literal.visit(
                    string=lambda value: '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"',
                    boolean=lambda value: f"{value}",
                )
                return ([literal_repr], False)
            return None
        if union.type == "named" and self.should_inline_away_type(union.type_id):
            return (self._enum_value_reprs(union.type_id), True)
        return None

    def get_inlined_undiscriminated_union_hint(
        self,
        members: List[ir_types.UndiscriminatedUnionMember],
        as_request: bool,
        get_member_hint: Callable[[ir_types.UndiscriminatedUnionMember], AST.TypeHint],
    ) -> Optional[AST.TypeHint]:
        """Builds the inlined type hint for an undiscriminated union, expanding
        literal-like members into a single combined `Literal[...]`. Returns None when
        no member is inlinable, so callers can fall back to the default rendering.
        """
        if not self.inline_undiscriminated_union_request_params:
            return None

        value_reprs: List[str] = []
        seen_values: Set[str] = set()
        has_forward_compat = False
        other_hints: List[AST.TypeHint] = []
        inlined_any = False

        for member in members:
            extracted = self._literal_value_reprs_for_member(member.type)
            if extracted is None:
                other_hints.append(get_member_hint(member))
                continue
            inlined_any = True
            reprs, member_has_forward_compat = extracted
            has_forward_compat = has_forward_compat or member_has_forward_compat
            for value_repr in reprs:
                if value_repr not in seen_values:
                    seen_values.add(value_repr)
                    value_reprs.append(value_repr)

        if not inlined_any:
            return None

        hints: List[AST.TypeHint] = list(other_hints)
        if value_reprs:
            hints.append(AST.TypeHint.literal(AST.Expression(", ".join(value_reprs))))
        if has_forward_compat and not as_request:
            hints.append(AST.TypeHint.any())

        if len(hints) == 1:
            return hints[0]
        return AST.TypeHint.union(*hints)

    def maybe_get_inlined_hint_for_named_undiscriminated_union(
        self, type_id: ir_types.TypeId, as_request: bool
    ) -> Optional[AST.TypeHint]:
        if not self.inline_undiscriminated_union_request_params:
            return None
        declaration = self.ir.types.get(type_id)
        if declaration is None:
            return None
        shape = declaration.shape.get_as_union()
        if shape.type != "undiscriminatedUnion":
            return None
        return self.get_inlined_undiscriminated_union_hint(
            members=shape.members,
            as_request=as_request,
            get_member_hint=lambda member: self.get_type_hint_for_type_reference(member.type, in_endpoint=as_request),
        )

    def get_type_names_in_type_reference(self, type_reference: ir_types.TypeReference) -> Set[ir_types.TypeId]:
        return type_reference.visit(
            container=lambda container: container.visit(
                list_=lambda item_type: self.get_referenced_types_of_type_reference(item_type),
                set_=lambda item_type: self.get_referenced_types_of_type_reference(item_type),
                optional=lambda item_type: self.get_referenced_types_of_type_reference(item_type),
                nullable=lambda item_type: self.get_referenced_types_of_type_reference(item_type),
                map_=lambda map_type: self.get_referenced_types_of_type_reference(map_type.key_type).union(
                    self.get_referenced_types_of_type_reference(map_type.value_type)
                ),
                literal=lambda literal: set(),
            ),
            primitive=lambda primitive: set(),
            named=lambda type_name: set([type_name.type_id]),
            unknown=lambda: set(),
        )

    def maybe_get_type_ids_for_type_reference(
        self, type_reference: ir_types.TypeReference
    ) -> Optional[List[ir_types.TypeId]]:
        return type_reference.visit(
            container=lambda ct: ct.visit(
                list_=lambda list_tr: self.maybe_get_type_ids_for_type_reference(list_tr),
                map_=lambda mt: (
                    (self.maybe_get_type_ids_for_type_reference(mt.key_type) or [])
                    + (self.maybe_get_type_ids_for_type_reference(mt.value_type) or [])
                ),
                nullable=lambda nullable_tr: self.maybe_get_type_ids_for_type_reference(nullable_tr),
                optional=lambda optional_tr: self.maybe_get_type_ids_for_type_reference(optional_tr),
                set_=lambda set_tr: self.maybe_get_type_ids_for_type_reference(set_tr),
                literal=lambda _: None,
            ),
            named=lambda nt: [nt.type_id],
            primitive=lambda _: None,
            unknown=lambda: None,
        )

    # Unwrap optional and alias example references
    def unwrap_example_type_reference(
        self, example_type_reference: ir_types.ExampleTypeReference
    ) -> ir_types.ExampleTypeReference:
        return example_type_reference.shape.visit(
            primitive=lambda _: example_type_reference,
            named=lambda named: named.shape.visit(
                alias=lambda alias: self.unwrap_example_type_reference(alias.value),
                enum=lambda _: example_type_reference,
                object=lambda _: example_type_reference,
                union=lambda _: example_type_reference,
                undiscriminated_union=lambda _: example_type_reference,
            ),
            container=lambda container: container.visit(
                list_=lambda _: example_type_reference,
                set_=lambda _: example_type_reference,
                optional=lambda optional: (
                    self.unwrap_example_type_reference(optional.optional)
                    if optional.optional is not None
                    else example_type_reference
                ),
                nullable=lambda nullable: (
                    self.unwrap_example_type_reference(nullable.nullable)
                    if nullable.nullable is not None
                    else example_type_reference
                ),
                map_=lambda _: example_type_reference,
                literal=lambda _: example_type_reference,
            ),
            unknown=lambda _: example_type_reference,
        )
