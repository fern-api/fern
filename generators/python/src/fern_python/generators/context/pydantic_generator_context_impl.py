from typing import Callable, List, Optional, Set

import fern.ir.resources as ir_types
from fern.generator_exec.resources import GeneratorConfig

from fern_python.codegen import AST, Filepath
from fern_python.declaration_referencer import AbstractDeclarationReferencer

from .pydantic_generator_context import PydanticGeneratorContext
from .type_reference_to_type_hint_converter import TypeReferenceToTypeHintConverter


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
        reserved_names: Optional[Set[str]] = None,
    ):
        super().__init__(
            ir=ir,
            generator_config=generator_config,
            allow_skipping_validation=allow_skipping_validation,
            use_typeddict_requests=use_typeddict_requests,
            type_declaration_referencer=type_declaration_referencer,
            use_str_enums=use_str_enums,
        )
        self._type_reference_to_type_hint_converter = TypeReferenceToTypeHintConverter(
            type_declaration_referencer=type_declaration_referencer, context=self
        )
        self._type_declaration_referencer = type_declaration_referencer
        self._project_module_path = project_module_path
        self._allow_leveraging_defaults = allow_leveraging_defaults
        self._reserved_names: Set[str] = reserved_names or set()

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
    ) -> Optional[AST.Expression]:
        if not self._allow_leveraging_defaults:
            return None

        default_value = None
        union = type_reference.get_as_union()
        if union.type == "primitive":
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

    def do_types_reference_each_other(self, a: ir_types.TypeId, b: ir_types.TypeId) -> bool:
        return self.does_type_reference_other_type(a, b) and self.does_type_reference_other_type(b, a)

    def does_type_reference_other_type(self, type_id: ir_types.TypeId, other_type_id: ir_types.TypeId) -> bool:
        referenced_types = self.get_referenced_types(type_id)
        return other_type_id in referenced_types

    def get_referenced_types(self, type_id: ir_types.TypeId) -> Set[ir_types.TypeId]:
        declaration = self.ir.types[type_id]
        return self.get_referenced_types_of_type_declaration(declaration)

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
        if shape.type != "object":
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
                map_=lambda mt: (self.maybe_get_type_ids_for_type_reference(mt.key_type) or []).extend(
                    self.maybe_get_type_ids_for_type_reference(mt.value_type) or []
                ),
                optional=lambda optional_tr: self.maybe_get_type_ids_for_type_reference(optional_tr),
                set_=lambda set_tr: self.maybe_get_type_ids_for_type_reference(set_tr),
                literal=lambda _: None,
            ),
            named=lambda nt: [nt.type_id],
            primitive=lambda _: None,
            unknown=lambda: None,
        )
