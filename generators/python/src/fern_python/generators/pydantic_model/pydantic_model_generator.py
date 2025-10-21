from __future__ import annotations

from typing import TYPE_CHECKING, Dict, Literal, Set, Tuple

if TYPE_CHECKING:
    from ..context.pydantic_generator_context import PydanticGeneratorContext

import fern.ir.resources as ir_types
from ..context.pydantic_generator_context_impl import PydanticGeneratorContextImpl
from .circular_reference_resolver import CircularReferenceResolver
from .custom_config import PydanticModelCustomConfig
from .type_declaration_handler import (
    TypeDeclarationHandler,
    TypeDeclarationSnippetGeneratorBuilder,
)
from .type_declaration_referencer import TypeDeclarationReferencer
from fern.generator_exec.config import GeneratorConfig
from ordered_set import OrderedSet

from fern_python.cli.abstract_generator import AbstractGenerator
from fern_python.codegen import Filepath, Project
from fern_python.generator_exec_wrapper import GeneratorExecWrapper
from fern_python.generators.pydantic_model.model_utilities import can_be_fern_model
from fern_python.snippet import SnippetRegistry, SnippetWriter


class PydanticModelGenerator(AbstractGenerator):
    def project_type(self) -> Literal["sdk", "pydantic", "fastapi"]:
        return "pydantic"

    def should_fix_files(self) -> bool:
        return True

    def should_format_files(
        self,
        *,
        generator_config: GeneratorConfig,
    ) -> bool:
        custom_config = PydanticModelCustomConfig.parse_obj(generator_config.custom_config or {})
        return not custom_config.skip_formatting

    def should_use_lazy_imports(
        self,
        *,
        generator_config: GeneratorConfig,
    ) -> bool:
        return False

    def get_relative_path_to_project_for_publish(
        self,
        *,
        generator_config: GeneratorConfig,
        ir: ir_types.IntermediateRepresentation,
    ) -> Tuple[str, ...]:
        custom_config = PydanticModelCustomConfig.parse_obj(generator_config.custom_config or {})
        if custom_config.package_name is not None:
            return (custom_config.package_name,)

        cleaned_org_name = self._clean_organization_name(generator_config.organization)
        return (
            cleaned_org_name,
            ir.api_name.snake_case.safe_name,
        )

    def run(
        self,
        *,
        generator_exec_wrapper: GeneratorExecWrapper,
        ir: ir_types.IntermediateRepresentation,
        generator_config: GeneratorConfig,
        project: Project,
    ) -> None:
        custom_config = PydanticModelCustomConfig.parse_obj(generator_config.custom_config or {})
        context = PydanticGeneratorContextImpl(
            ir=ir,
            type_declaration_referencer=TypeDeclarationReferencer(
                use_typeddict_requests=custom_config.use_typeddict_requests, types=ir.types
            ),
            generator_config=generator_config,
            project_module_path=self.get_relative_path_to_project_for_publish(
                generator_config=generator_config,
                ir=ir,
            ),
            allow_skipping_validation=custom_config.skip_validation,
            allow_leveraging_defaults=custom_config.use_provided_defaults,
            use_typeddict_requests=custom_config.use_typeddict_requests,
            use_str_enums=custom_config.use_str_enums,
            skip_formatting=custom_config.skip_formatting,
            union_naming_version=custom_config.union_naming,
            use_pydantic_field_aliases=custom_config.use_pydantic_field_aliases,
            pydantic_compatibility=custom_config.version,
        )
        snippet_registry = SnippetRegistry(source_file_factory=context.source_file_factory)
        snippet_writer = self._build_snippet_writer(
            context=context, improved_imports=False, use_str_enums=custom_config.use_str_enums
        )
        self.generate_types(
            generator_exec_wrapper=generator_exec_wrapper,
            ir=ir,
            custom_config=custom_config,
            project=project,
            context=context,
            snippet_registry=snippet_registry,
            snippet_writer=snippet_writer,
        )
        context.core_utilities.copy_to_project(project=project)

    def postrun(self, *, generator_exec_wrapper: GeneratorExecWrapper) -> None:
        pass

    def generate_types(
        self,
        *,
        generator_exec_wrapper: GeneratorExecWrapper,
        ir: ir_types.IntermediateRepresentation,
        custom_config: PydanticModelCustomConfig,
        project: Project,
        context: "PydanticGeneratorContext",
        snippet_registry: SnippetRegistry,
        snippet_writer: SnippetWriter,
    ) -> None:
        resolver = CircularReferenceResolver(ir.types)
        mutually_recursive_groups = resolver.find_mutually_recursive_groups()
        
        type_id_to_group: Dict[ir_types.TypeId, OrderedSet[ir_types.TypeId]] = {}
        for group in mutually_recursive_groups:
            for type_id in group:
                type_id_to_group[type_id] = group
        
        generated_groups: Set[frozenset[ir_types.TypeId]] = set()
        
        for type_to_generate in ir.types.values():
            type_id = type_to_generate.name.type_id
            
            if type_id in type_id_to_group:
                group = type_id_to_group[type_id]
                group_key = frozenset(group)
                
                if group_key not in generated_groups:
                    self._generate_consolidated_types(
                        project=project,
                        group=group,
                        generator_exec_wrapper=generator_exec_wrapper,
                        custom_config=custom_config,
                        context=context,
                        snippet_registry=snippet_registry,
                        snippet_writer=snippet_writer,
                        ir=ir,
                    )
                    generated_groups.add(group_key)
            else:
                self._generate_type(
                    project,
                    type=type_to_generate,
                    generator_exec_wrapper=generator_exec_wrapper,
                    custom_config=custom_config,
                    context=context,
                    snippet_registry=snippet_registry,
                    snippet_writer=snippet_writer,
                )

    def _should_generate_typedict(self, context: "PydanticGeneratorContext", type_: ir_types.Type) -> bool:
        return context.use_typeddict_requests and can_be_fern_model(type_, context.ir.types)

    def _generate_type(
        self,
        project: Project,
        type: ir_types.TypeDeclaration,
        generator_exec_wrapper: GeneratorExecWrapper,
        custom_config: PydanticModelCustomConfig,
        context: "PydanticGeneratorContext",
        snippet_registry: SnippetRegistry,
        snippet_writer: SnippetWriter,
    ) -> None:
        # TODO: Actually flag typeddicts if they're request object ONLY, right now we just always create
        # the typeddict for any object. This is fine for now, but we should be able to filter the types down.

        # Write the typeddict request
        if self._should_generate_typedict(context=context, type_=type.shape):
            typeddict_filepath = context.get_filepath_for_type_id(type_id=type.name.type_id, as_request=True)
            typeddict_source_file = context.source_file_factory.create(
                project=project, filepath=typeddict_filepath, generator_exec_wrapper=generator_exec_wrapper
            )

            typeddict_handler = TypeDeclarationHandler(
                declaration=type,
                context=context,
                custom_config=custom_config,
                source_file=typeddict_source_file,
                snippet_writer=snippet_writer,
                generate_typeddict_request=True,
            )
            typeddict_handler.run()

            project.write_source_file(source_file=typeddict_source_file, filepath=typeddict_filepath)

        # Write the pydantic model
        filepath = context.get_filepath_for_type_id(type_id=type.name.type_id, as_request=False)
        source_file = context.source_file_factory.create(
            project=project, filepath=filepath, generator_exec_wrapper=generator_exec_wrapper
        )

        type_declaration_handler = TypeDeclarationHandler(
            declaration=type,
            context=context,
            custom_config=custom_config,
            source_file=source_file,
            snippet_writer=snippet_writer,
            generate_typeddict_request=False,
        )
        generated_type = type_declaration_handler.run()
        if generated_type.snippet is not None:
            snippet_registry.register_snippet(
                type_id=type.name.type_id,
                expr=generated_type.snippet,
            )
        project.write_source_file(source_file=source_file, filepath=filepath)

    def _generate_consolidated_types(
        self,
        project: Project,
        group: OrderedSet[ir_types.TypeId],
        generator_exec_wrapper: GeneratorExecWrapper,
        custom_config: PydanticModelCustomConfig,
        context: "PydanticGeneratorContext",
        snippet_registry: SnippetRegistry,
        snippet_writer: SnippetWriter,
        ir: ir_types.IntermediateRepresentation,
    ) -> None:
        resolver = CircularReferenceResolver(ir.types)
        consolidated_filename = resolver.get_consolidated_filename(group)
        
        first_type_id = next(iter(group))
        first_type = ir.types[first_type_id]
        base_filepath = context.get_filepath_for_type_id(type_id=first_type_id, as_request=False)
        
        
        consolidated_filepath = Filepath(
            directories=base_filepath.directories,
            file=Filepath.FilepathPart(
                module_name=consolidated_filename,
            ),
        )
        
        from fern_python.codegen.reference_resolver_impl import ReferenceResolverImpl
        from fern_python.codegen.source_file import SourceFileImpl
        
        module = consolidated_filepath.to_module()
        consolidated_source_file = SourceFileImpl(
            module_path=module.path,
            completion_listener=lambda _: None,  # No-op callback to prevent export registration
            reference_resolver=ReferenceResolverImpl(
                module_path_of_source_file=module.path,
            ),
            dependency_manager=project._dependency_manager,
            should_format=False,
            whitelabel=False,
        )
        
        for type_id in group:
            type_declaration = ir.types[type_id]
            
            type_declaration_handler = TypeDeclarationHandler(
                declaration=type_declaration,
                context=context,
                custom_config=custom_config,
                source_file=consolidated_source_file,
                snippet_writer=snippet_writer,
                generate_typeddict_request=False,
            )
            generated_type = type_declaration_handler.run()
            if generated_type.snippet is not None:
                snippet_registry.register_snippet(
                    type_id=type_declaration.name.type_id,
                    expr=generated_type.snippet,
                )
        
        import os
        full_path = project.get_source_file_filepath(consolidated_filepath, include_src_root=True)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        consolidated_source_file.write_to_file(filepath=full_path)
        
        for type_id in group:
            type_declaration = ir.types[type_id]
            self._generate_stub_file(
                project=project,
                type_declaration=type_declaration,
                consolidated_filename=consolidated_filename,
                context=context,
                generator_exec_wrapper=generator_exec_wrapper,
            )

    def _generate_stub_file(
        self,
        project: Project,
        type_declaration: ir_types.TypeDeclaration,
        consolidated_filename: str,
        context: "PydanticGeneratorContext",
        generator_exec_wrapper: GeneratorExecWrapper,
    ) -> None:
        filepath = context.get_filepath_for_type_id(type_id=type_declaration.name.type_id, as_request=False)
        
        class_name = context.get_class_name_for_type_id(type_id=type_declaration.name.type_id, as_request=False)
        
        exports_to_add = [class_name]
        
        shape = type_declaration.shape.get_as_union()
        if shape.type == "union":
            for member in shape.types:
                member_class_name = context.get_class_name_for_type_id(
                    type_id=type_declaration.name.type_id, as_request=False
                ) + "_" + member.discriminant_value.name.pascal_case.safe_name
                exports_to_add.append(member_class_name)
        elif shape.type == "undiscriminatedUnion":
            base_class_name = context.get_class_name_for_type_id(
                type_id=type_declaration.name.type_id, as_request=False
            )
            for undiscriminated_member in shape.members:
                member_type_ref = undiscriminated_member.type.get_as_union()
                if member_type_ref.type == "container":
                    container_type = member_type_ref.container.get_as_union()
                    if container_type.type == "list":
                        member_class_name = f"{base_class_name}_List"
                    elif container_type.type == "optional":
                        member_class_name = f"{base_class_name}_Optional"
                    else:
                        continue
                    exports_to_add.append(member_class_name)
        
        stub_content = "# This file was auto-generated by Fern from our API Definition.\n\n"
        stub_content += f"from .{consolidated_filename} import {', '.join(exports_to_add)}\n\n"
        stub_content += f"__all__ = [{', '.join(repr(e) for e in exports_to_add)}]\n"
        
        import os
        full_path = project.get_source_file_filepath(filepath, include_src_root=True)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'w') as f:
            f.write(stub_content)
        
        project.register_export_in_project(filepath, set(exports_to_add))

    def get_sorted_modules(self) -> None:
        return None

    def is_flat_layout(
        self,
        *,
        generator_config: GeneratorConfig,
    ) -> bool:
        return False

    def _build_snippet_writer(
        self, context: "PydanticGeneratorContext", improved_imports: bool = False, use_str_enums: bool = False
    ) -> SnippetWriter:
        """
        Note that this function is a copy of the function with the same name in
        the fern_python.utils package. This is redeclared here to prevent an import
        cycle.
        """
        snippet_writer = SnippetWriter(
            context=context,
            improved_imports=improved_imports,
        )

        builder = TypeDeclarationSnippetGeneratorBuilder(
            context=context,
            snippet_writer=snippet_writer,
        )
        type_declaration_snippet_generator = builder.get_generator()

        snippet_writer._type_declaration_snippet_generator = type_declaration_snippet_generator

        return snippet_writer
