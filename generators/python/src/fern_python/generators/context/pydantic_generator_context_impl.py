from __future__ import annotations

from collections import defaultdict
from typing import Callable, Dict, List, Optional, Set

import fern.ir.resources as ir_types
from ...external_dependencies.pydantic import PydanticVersionCompatibility
from .pydantic_generator_context import PydanticGeneratorContext
from .type_reference_to_type_hint_converter import TypeReferenceToTypeHintConverter
from fern.generator_exec import GeneratorConfig
from ordered_set import OrderedSet

from fern_python.codegen import AST, Filepath
from fern_python.declaration_referencer import AbstractDeclarationReferencer
from fern_python.generators.pydantic_model.custom_config import UnionNamingVersions


class PydanticGeneratorContextImpl(PydanticGeneratorContext):
    def __init__(
        self,
        ir: ir_types.IntermediateRepresentation,
        type_declaration_referencer: AbstractDeclarationReferencer[ir_types.DeclaredTypeName],
        generator_config: GeneratorConfig,
        project_module_path: AST.ModulePath,
        allow_skipping_validation: bool,
        allow_leveraging_defaults: bool,
        use_typeddict_requests: bool,
        use_str_enums: bool,
        skip_formatting: bool,
        union_naming_version: UnionNamingVersions,
        use_pydantic_field_aliases: bool,
        pydantic_compatibility: PydanticVersionCompatibility,
        reserved_names: Optional[Set[str]] = None,
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
        self._types_with_union_self_referencing_members: Dict[ir_types.TypeId, OrderedSet[ir_types.TypeId]] = (
            defaultdict(OrderedSet)
        )

        for id, type in self.ir.types.items():
            ordered_reference_types = OrderedSet(list(sorted(type.referenced_types)))
            for referenced_id in ordered_reference_types:
                referenced_type = self.ir.types[referenced_id]
                referenced_type_shape = referenced_type.shape.get_as_union()
                if referenced_type_shape.type != "union" and referenced_type_shape.type != "undiscriminatedUnion":
                    # This referenced type is self-referential
                    if referenced_id in referenced_type.referenced_types:
                        self._types_with_non_union_self_referencing_dependencies[id].add(referenced_id)
                # TODO(tjb9dc): handle discriminated unions as well
                elif referenced_type_shape.type == "undiscriminatedUnion":
                    # For unions, apply the same logic but looking at the variants, and import more shallowly
                    for member in referenced_type_shape.members:
                        member_type_ids = self.get_type_names_in_type_reference(member.type)
                        member_references = self.get_referenced_types_of_type_reference(member.type)
                        if id in member_references:
                            self._types_with_union_self_referencing_members[referenced_id].update(member_type_ids)

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
    ) -> Optional[AST.Expression]:
        default_value = None
        union = type_reference.get_as_union()

        # Only populate primitive defaults if we're allowed to leverage them via config
        # Otherwise we want to be able to generate defaults for literals, and aliases of literals
        if union.type == "primitive" and self._allow_leveraging_defaults:
            maybe_v2_scheme = union.primitive.v_2
            if maybe_v2_scheme is not None:
                default_value = maybe_v2_scheme.visit(
                    integer=lambda it: AST.Expression(f"{it.default}") if it.default is not None else None,
                    double=lambda dt: AST.Expression(f"{dt.default}") if dt.default is not None else None,
                    string=lambda st: AST.Expression(f'"{st.default}"') if st.default is not None else None,
                    boolean=lambda bt: AST.Expression(f"{bt.default}") if bt.default is not None else None,
                    long_=lambda lt: AST.Expression(f"{lt.default}") if lt.default is not None else None,
                    big_integer=lambda bit: AST.Expression(f'"{bit.default}"') if bit.default is not None else None,
                    uint=lambda _: None,
                    uint_64=lambda _: None,
                    date=lambda _: None,
                    date_time=lambda _: None,
                    uuid_=lambda _: None,
                    base_64=lambda _: None,
                    float_=lambda _: None,
                )
        elif union.type == "named":
            type_declaration = self.get_declaration_for_type_id(union.type_id)
            default_value = type_declaration.shape.visit(
                alias=lambda a: self.get_initializer_for_type_reference(a.alias_of, ignore_literals=ignore_literals),
                enum=lambda _: None,
                object=lambda _: None,
                union=lambda _: None,
                undiscriminated_union=lambda _: None,
            )
        elif union.type == "container":
            default_value = union.container.visit(
                literal=lambda lv: lv.visit(
                    string=lambda s: AST.Expression(f'"{s}"'),
                    boolean=lambda b: AST.Expression(f"{b}"),
                )
                if not ignore_literals
                else None,
                list_=lambda _: None,
                set_=lambda _: None,
                # Ignore literal defaults when the wrapping type is optional
                optional=lambda opt: self.get_initializer_for_type_reference(opt, ignore_literals=True),
                nullable=lambda nullable: self.get_initializer_for_type_reference(nullable, ignore_literals=True),
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

    def get_union_self_referencing_members_from_types(
        self,
    ) -> Dict[ir_types.TypeId, OrderedSet[ir_types.TypeId]]:
        return self._types_with_union_self_referencing_members

    def do_types_reference_each_other(self, a: ir_types.TypeId, b: ir_types.TypeId) -> bool:
        return self.does_type_reference_other_type(a, b) and self.does_type_reference_other_type(b, a)

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
                    f"Cannot get properties because {declaration.name.name.original_name} is not an object, it's a {shape.type}"
                )
            else:
                return self.get_all_properties_including_extensions(resolved_type_union.name.type_id)
        elif shape.type != "object":
            raise RuntimeError(
                f"Cannot get properties because {declaration.name.name.original_name} is not an object, it's a {shape.type}"
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
                map_=lambda map_type: (
                    self.get_referenced_types_of_type_reference(map_type.key_type).union(
                        self.get_referenced_types_of_type_reference(map_type.value_type)
                    )
                ),
                literal=lambda literal: set(),
            ),
            primitive=lambda primitive: set(),
            named=lambda type_name: self.get_referenced_types_of_type_declaration(
                self.get_declaration_for_type_id(type_name.type_id),
            ),
            unknown=lambda: set(),
        )

    def get_type_names_in_type_reference(self, type_reference: ir_types.TypeReference) -> Set[ir_types.TypeId]:
        return type_reference.visit(
            container=lambda container: container.visit(
                list_=lambda item_type: self.get_referenced_types_of_type_reference(item_type),
                set_=lambda item_type: self.get_referenced_types_of_type_reference(item_type),
                optional=lambda item_type: self.get_referenced_types_of_type_reference(item_type),
                nullable=lambda item_type: self.get_referenced_types_of_type_reference(item_type),
                map_=lambda map_type: (
                    self.get_referenced_types_of_type_reference(map_type.key_type).union(
                        self.get_referenced_types_of_type_reference(map_type.value_type)
                    )
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
                map_=lambda mt: (self.maybe_get_type_ids_for_type_reference(mt.key_type) or [])
                + (self.maybe_get_type_ids_for_type_reference(mt.value_type) or []),
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
                optional=lambda optional: self.unwrap_example_type_reference(optional.optional)
                if optional.optional is not None
                else example_type_reference,
                nullable=lambda nullable: self.unwrap_example_type_reference(nullable.nullable)
                if nullable.nullable is not None
                else example_type_reference,
                map_=lambda _: example_type_reference,
                literal=lambda _: example_type_reference,
            ),
            unknown=lambda _: example_type_reference,
        )
