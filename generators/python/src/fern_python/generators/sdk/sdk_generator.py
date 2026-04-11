import sys
from typing import Literal, Optional, Sequence, Tuple, Union, cast

from .client_generator.client_generator import ClientGenerator
from .client_generator.generated_root_client import GeneratedRootClient, RootClient
from .client_generator.inferred_auth_token_provider_generator import InferredAuthTokenProviderGenerator
from .client_generator.oauth_token_provider_generator import OAuthTokenProviderGenerator
from .client_generator.raw_client_generator import RawClientGenerator
from .client_generator.root_client_generator import RootClientGenerator
from .client_generator.socket_client_generator import SocketClientGenerator
from .custom_config import (
    BaseDependencyCustomConfig,
    DependencyCustomConfig,
    SDKCustomConfig,
)
from .environment_generators import (
    GeneratedEnvironment,
    MultipleBaseUrlsEnvironmentGenerator,
    SingleBaseUrlEnvironmentGenerator,
)
from .error_generator.error_generator import ErrorGenerator
from .v2.generator import PythonV2Generator
from fern_python.cli.abstract_generator import AbstractGenerator
from fern_python.codegen import AST, Project
from fern_python.codegen.filepath import Filepath
from fern_python.codegen.module_manager import ModuleExport
from fern_python.generator_exec_wrapper import GeneratorExecWrapper
from fern_python.generators.pydantic_model.pydantic_model_generator import PydanticModelGenerator
from fern_python.generators.sdk import as_is_copier
from fern_python.generators.sdk.client_generator.endpoint_metadata_collector import (
    EndpointMetadataCollector,
)
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext
from fern_python.generators.sdk.context.sdk_generator_context_impl import (
    SdkGeneratorContextImpl,
)
from fern_python.generators.sdk.core_utilities.client_wrapper_generator import (
    ClientWrapperGenerator,
)
from fern_python.snippet import SnippetRegistry, SnippetWriter
from fern_python.snippet.snippet_test_factory import SnippetTestFactory
from fern_python.utils import build_snippet_writer

import fern.ir.resources as ir_types
from fern.generator_exec import GeneratorUpdate, LogLevel, LogUpdate, Snippets
from fern.generator_exec.config import GeneratorConfig


class SdkGenerator(AbstractGenerator):
    def project_type(self) -> Literal["sdk", "pydantic", "fastapi"]:
        return "sdk"

    def should_fix_files(self) -> bool:
        return True

    def should_format_files(
        self,
        *,
        generator_config: GeneratorConfig,
    ) -> bool:
        custom_config = SDKCustomConfig.parse_obj(generator_config.custom_config or {})
        return not custom_config.skip_formatting

    def should_use_lazy_imports(
        self,
        *,
        generator_config: GeneratorConfig,
    ) -> bool:
        custom_config = SDKCustomConfig.parse_obj(generator_config.custom_config or {})
        return custom_config.lazy_imports

    def get_relative_path_to_project_for_publish(
        self,
        *,
        generator_config: GeneratorConfig,
        ir: ir_types.IntermediateRepresentation,
    ) -> Tuple[str, ...]:
        custom_config = SDKCustomConfig.parse_obj(generator_config.custom_config or {})
        if custom_config.package_name is not None:
            return (custom_config.package_name,)

        cleaned_org_name = self._clean_organization_name(generator_config.organization)
        return (
            (
                cleaned_org_name,
                ir.api_name.snake_case.safe_name,
            )
            if custom_config.use_api_name_in_package
            else (cleaned_org_name,)
        )

    def run(
        self,
        *,
        generator_exec_wrapper: GeneratorExecWrapper,
        ir: ir_types.IntermediateRepresentation,
        generator_config: GeneratorConfig,
        project: Project,
    ) -> None:
        custom_config = SDKCustomConfig.parse_obj(generator_config.custom_config or {})

        if custom_config.client_filename is not None and not custom_config.client_filename.endswith(".py"):
            raise RuntimeError("client_filename must end in .py")

        if not custom_config.client.filename.endswith(".py"):
            raise RuntimeError("client_location.filename must end in .py")

        if not custom_config.client.exported_filename.endswith(".py"):
            raise RuntimeError("client_location.exported_filename must end in .py")

        for dep, value in custom_config.extra_dependencies.items():
            if type(value) is str:
                project.add_dependency(dependency=AST.Dependency(name=dep, version=value), is_user_override=True)
            elif isinstance(value, DependencyCustomConfig):
                project.add_dependency(
                    dependency=AST.Dependency(
                        name=dep, version=value.version, optional=value.optional, python=value.python
                    ),
                    is_user_override=True,
                )

        # Merge user-defined extras with the built-in aiohttp extra
        extras = dict(custom_config.extras)
        aiohttp_deps = ["aiohttp", "httpx-aiohttp"]
        existing = extras.get("aiohttp", [])
        extras["aiohttp"] = list(dict.fromkeys(existing + aiohttp_deps))
        project.add_extra(extras)

        # Add optional dependencies for aiohttp support
        project.add_dependency(dependency=AST.Dependency(name="httpx-aiohttp", version="0.1.8", optional=True))
        project.add_dependency(dependency=AST.Dependency(name="aiohttp", version=">=3.10.0,<4", optional=True))

        for dep, bas_dep_value in custom_config.extra_dev_dependencies.items():
            if type(bas_dep_value) is str:
                project.add_dev_dependency(
                    dependency=AST.Dependency(name=dep, version=bas_dep_value), is_user_override=True
                )
            elif isinstance(bas_dep_value, BaseDependencyCustomConfig):
                project.add_dev_dependency(
                    dependency=AST.Dependency(
                        name=dep,
                        version=bas_dep_value.version,
                        extras=tuple(bas_dep_value.extras) if bas_dep_value.extras is not None else None,
                    ),
                    is_user_override=True,
                )

        # Export from root init
        if custom_config.additional_init_exports is not None:
            project.add_init_exports(path=(), exports=custom_config.additional_init_exports)

        self._pydantic_model_custom_config = custom_config.pydantic_config

        context = SdkGeneratorContextImpl(
            ir=ir,
            generator_config=generator_config,
            custom_config=custom_config,
            project_module_path=self.get_relative_path_to_project_for_publish(
                generator_config=generator_config,
                ir=ir,
            ),
        )
        snippet_registry = SnippetRegistry(source_file_factory=context.source_file_factory)
        snippet_writer = build_snippet_writer(
            context=context.pydantic_generator_context,
            improved_imports=custom_config.improved_imports,
            use_str_enums=custom_config.pydantic_config.use_str_enums,
        )
        PydanticModelGenerator().generate_types(
            generator_exec_wrapper=generator_exec_wrapper,
            custom_config=self._pydantic_model_custom_config,
            ir=ir,
            project=project,
            context=context.pydantic_generator_context,
            snippet_registry=snippet_registry,
            snippet_writer=snippet_writer,
        )

        generated_environment: Optional[GeneratedEnvironment] = None
        base_environment: Optional[Union[SingleBaseUrlEnvironmentGenerator, MultipleBaseUrlsEnvironmentGenerator]] = (
            None
        )
        if ir.environments is not None:
            base_environment = self._generate_environments_base(
                context=context, environments=ir.environments.environments
            )
            generated_environment = self._generate_environments(
                context=context,
                environments=base_environment,
                generator_exec_wrapper=generator_exec_wrapper,
                project=project,
            )

        maybe_oauth_scheme = next(
            (scheme for scheme in context.ir.auth.schemes if scheme.get_as_union().type == "oauth"), None
        )
        oauth_scheme = (
            maybe_oauth_scheme.visit(
                bearer=lambda _: None,
                basic=lambda _: None,
                header=lambda _: None,
                oauth=lambda oauth: oauth,
                inferred=lambda _: None,
            )
            if maybe_oauth_scheme is not None and generator_config.generate_oauth_clients
            else None
        )
        if oauth_scheme is not None:
            self._generate_oauth_token_provider(
                context=context,
                ir=ir,
                generator_exec_wrapper=generator_exec_wrapper,
                project=project,
                oauth_scheme=oauth_scheme,
            )

        maybe_inferred_auth_scheme = next(
            (scheme for scheme in context.ir.auth.schemes if scheme.get_as_union().type == "inferred"), None
        )
        inferred_auth_scheme = (
            maybe_inferred_auth_scheme.visit(
                bearer=lambda _: None,
                basic=lambda _: None,
                header=lambda _: None,
                oauth=lambda _: None,
                inferred=lambda inferred: inferred,
            )
            if maybe_inferred_auth_scheme is not None
            else None
        )
        if inferred_auth_scheme is not None:
            self._generate_inferred_auth_token_provider(
                context=context,
                ir=ir,
                generator_exec_wrapper=generator_exec_wrapper,
                project=project,
                inferred_auth_scheme=inferred_auth_scheme,
            )

        self._generate_client_wrapper(
            context=context,
            generated_environment=generated_environment,
            generator_exec_wrapper=generator_exec_wrapper,
            project=project,
        )

        self._generate_version(project=project)

        endpoint_metadata_collector = EndpointMetadataCollector()

        generated_root_client = self._generate_root_client(
            context=context,
            ir=ir,
            generated_environment=generated_environment,
            generator_exec_wrapper=generator_exec_wrapper,
            project=project,
            snippet_registry=snippet_registry,
            snippet_writer=snippet_writer,
            endpoint_metadata_collector=endpoint_metadata_collector,
            oauth_scheme=oauth_scheme,
        )

        # If exported_filename differs from filename, generate an inheritance-based wrapper
        actual_filename = custom_config.client_filename or custom_config.client.filename
        if custom_config.client.exported_filename != actual_filename:
            self._generate_exported_client_wrapper(
                context=context,
                custom_config=custom_config,
                project=project,
                generated_root_client=generated_root_client,
                generator_exec_wrapper=generator_exec_wrapper,
            )

        # Since you can customize the client export, we handle it here to capture the generated
        # and non-generated cases. If we were to base this off exporting the class declaration
        # we would have to handle the case where the exported client is not generated.
        # So we do it here to have a single source of truth for both cases.
        root_client_name = context.get_class_name_for_exported_root_client()
        exported_filename = custom_config.client.exported_filename
        # Remove .py from the end of the filename
        if exported_filename.endswith(".py"):
            exported_filename = exported_filename[:-3]
        project.add_init_exports(
            path=(),
            exports=[
                ModuleExport(
                    from_=exported_filename,
                    imports=[
                        root_client_name,
                        "Async" + root_client_name,
                    ],
                )
            ],
        )

        # Generate _default_clients.py with aiohttp auto-detection convenience classes
        self._generate_default_clients(
            context=context,
            project=project,
        )

        # Generate test_aiohttp_autodetect.py test file
        self._generate_aiohttp_test(
            context=context,
            project=project,
        )

        for subpackage_id in ir.subpackages.keys():
            subpackage = ir.subpackages[subpackage_id]
            if subpackage.has_endpoints_in_tree or (
                subpackage.websocket is not None and context.custom_config.should_generate_websocket_clients
            ):
                channel_websocket = (
                    ir.websocket_channels[subpackage.websocket]
                    if ir.websocket_channels and subpackage.websocket
                    else None
                )
                self._generate_subpackage_client(
                    context=context,
                    generator_exec_wrapper=generator_exec_wrapper,
                    subpackage_id=subpackage_id,
                    subpackage=subpackage,
                    websocket=channel_websocket,
                    project=project,
                    generated_root_client=generated_root_client,
                    snippet_registry=snippet_registry,
                    snippet_writer=snippet_writer,
                    endpoint_metadata_collector=endpoint_metadata_collector,
                )

        for error in ir.errors.values():
            self._generate_error(
                context=context,
                generator_exec_wrapper=generator_exec_wrapper,
                error=error,
                project=project,
            )

        # Print the output mode
        output_mode = generator_config.output.mode.get_as_union().type
        print(f"Output mode: {output_mode}")

        snippets = snippet_registry.snippets()
        if snippets is not None and (
            generator_config.output.mode.get_as_union().type != "downloadFiles" or ir.self_hosted
        ):
            self._maybe_write_snippets(
                context=context,
                snippets=snippets,
                project=project,
            )

        context.core_utilities.copy_to_project(project=project)

        if not (generator_config.output.mode.get_as_union().type == "downloadFiles"):
            as_is_copier.copy_to_project(project=project)

        test_fac = SnippetTestFactory(
            project=project,
            context=context,
            generator_exec_wrapper=generator_exec_wrapper,
            generated_root_client=generated_root_client,
            generated_environment=base_environment,
        )

        # Only write unit tests if specified in config
        if context.custom_config.include_legacy_wire_tests and generator_config.write_unit_tests:
            self._write_snippet_tests(
                snippet_test_factory=test_fac,
                snippet_writer=snippet_writer,
                ir=ir,
            )

        if custom_config.pydantic_config.positional_single_property_constructors:
            warning_message = (
                "\x1b[31;1m"
                "WARNING: positional_single_property_constructors is enabled. "
                "This allows Wrapper('value') syntax for single-required-field models, but if the model "
                "later adds another required field, the positional __init__ will no longer be generated, "
                "causing runtime failures for existing code. Use keyword arguments (Wrapper(field='value')) "
                "for long-term stability."
                "\x1b[0m"
            )
            print(warning_message, file=sys.stderr)
            generator_exec_wrapper.send_update(
                GeneratorUpdate.factory.log(
                    LogUpdate(
                        level=LogLevel.WARN,
                        message=warning_message,
                    )
                )
            )

    def postrun(self, *, generator_exec_wrapper: GeneratorExecWrapper) -> None:
        # Finally, run the python-v2 generator.
        pythonv2 = PythonV2Generator(
            coordinator=generator_exec_wrapper,
        )
        pythonv2.run()

    def _generate_environments_base(
        self,
        context: SdkGeneratorContext,
        environments: ir_types.Environments,
    ) -> Union[SingleBaseUrlEnvironmentGenerator, MultipleBaseUrlsEnvironmentGenerator]:
        return cast(
            Union[SingleBaseUrlEnvironmentGenerator, MultipleBaseUrlsEnvironmentGenerator],
            environments.visit(
                single_base_url=lambda single_base_url_environments: SingleBaseUrlEnvironmentGenerator(
                    context=context, environments=single_base_url_environments
                ),
                multiple_base_urls=lambda multiple_base_urls_environments: MultipleBaseUrlsEnvironmentGenerator(
                    context=context, environments=multiple_base_urls_environments
                ),
            ),
        )

    def _generate_environments(
        self,
        context: SdkGeneratorContext,
        environments: Union[SingleBaseUrlEnvironmentGenerator, MultipleBaseUrlsEnvironmentGenerator],
        generator_exec_wrapper: GeneratorExecWrapper,
        project: Project,
    ) -> GeneratedEnvironment:
        filepath = context.get_filepath_for_environments_enum()
        source_file = context.source_file_factory.create(
            project=project, filepath=filepath, generator_exec_wrapper=generator_exec_wrapper
        )
        generated_environment = environments.generate(source_file=source_file)
        project.write_source_file(source_file=source_file, filepath=filepath)
        return generated_environment

    def _generate_client_wrapper(
        self,
        context: SdkGeneratorContext,
        generated_environment: Optional[GeneratedEnvironment],
        generator_exec_wrapper: GeneratorExecWrapper,
        project: Project,
    ) -> None:
        filepath = Filepath(
            directories=context.core_utilities.filepath,
            file=Filepath.FilepathPart(module_name="client_wrapper"),
        )
        source_file = context.source_file_factory.create(
            project=project, filepath=filepath, generator_exec_wrapper=generator_exec_wrapper
        )
        ClientWrapperGenerator(
            context=context,
            generated_environment=generated_environment,
        ).generate(source_file=source_file, project=project)
        project.write_source_file(source_file=source_file, filepath=filepath)

    def _generate_oauth_token_provider(
        self,
        context: SdkGeneratorContext,
        ir: ir_types.IntermediateRepresentation,
        generator_exec_wrapper: GeneratorExecWrapper,
        project: Project,
        oauth_scheme: ir_types.OAuthScheme,
    ) -> None:
        filepath = context.get_filepath_for_generated_oauth_token_provider()
        source_file = context.source_file_factory.create(
            project=project, filepath=filepath, generator_exec_wrapper=generator_exec_wrapper
        )
        OAuthTokenProviderGenerator(
            context=context,
            oauth_scheme=oauth_scheme,
        ).generate(source_file=source_file)
        project.write_source_file(source_file=source_file, filepath=filepath)

    def _generate_inferred_auth_token_provider(
        self,
        context: SdkGeneratorContext,
        ir: ir_types.IntermediateRepresentation,
        generator_exec_wrapper: GeneratorExecWrapper,
        project: Project,
        inferred_auth_scheme: ir_types.InferredAuthScheme,
    ) -> None:
        filepath = context.get_filepath_for_generated_inferred_auth_token_provider()
        source_file = context.source_file_factory.create(
            project=project, filepath=filepath, generator_exec_wrapper=generator_exec_wrapper
        )
        InferredAuthTokenProviderGenerator(
            context=context,
            inferred_auth_scheme=inferred_auth_scheme,
        ).generate(source_file=source_file)
        project.write_source_file(source_file=source_file, filepath=filepath)

    def _generate_root_client(
        self,
        context: SdkGeneratorContext,
        ir: ir_types.IntermediateRepresentation,
        generated_environment: Optional[GeneratedEnvironment],
        generator_exec_wrapper: GeneratorExecWrapper,
        project: Project,
        snippet_registry: SnippetRegistry,
        snippet_writer: SnippetWriter,
        endpoint_metadata_collector: EndpointMetadataCollector,
        oauth_scheme: Optional[ir_types.OAuthScheme] = None,
    ) -> GeneratedRootClient:
        filepath = context.get_filepath_for_generated_root_client()
        source_file = context.source_file_factory.create(
            project=project, filepath=filepath, generator_exec_wrapper=generator_exec_wrapper
        )
        root_client_generator = RootClientGenerator(
            context=context,
            package=ir.root_package,
            generated_environment=generated_environment,
            class_name=context.get_class_name_for_generated_root_client(),
            async_class_name="Async" + context.get_class_name_for_generated_root_client(),
            snippet_registry=snippet_registry,
            snippet_writer=snippet_writer,
            oauth_scheme=oauth_scheme,
            endpoint_metadata_collector=endpoint_metadata_collector,
            websocket=None,
            imports_manager=source_file.get_imports_manager(),
            reference_resolver=source_file.get_reference_resolver(),
        )
        root_client_generator.generate(source_file=source_file)
        generated_root_client = root_client_generator.get_generated_root_client()
        project.write_source_file(source_file=source_file, filepath=filepath)

        if ir.root_package.service is not None:
            raw_client_filepath = context.get_filepath_for_generated_raw_root_client()
            raw_client_source_file = context.source_file_factory.create(
                project=project, filepath=raw_client_filepath, generator_exec_wrapper=generator_exec_wrapper
            )
            RawClientGenerator(
                context=context,
                package=ir.root_package,
                subpackage_id=ir.root_package.service,
                class_name=context.get_class_name_for_generated_raw_root_client(),
                async_class_name=context.get_class_name_for_generated_async_raw_root_client(),
                generated_root_client=generated_root_client,
                snippet_registry=snippet_registry,
                snippet_writer=snippet_writer,
                endpoint_metadata_collector=endpoint_metadata_collector,
                websocket=None,
                imports_manager=raw_client_source_file.get_imports_manager(),
                reference_resolver=raw_client_source_file.get_reference_resolver(),
            ).generate(source_file=raw_client_source_file)
            project.write_source_file(source_file=raw_client_source_file, filepath=raw_client_filepath)
        return generated_root_client

    def _generate_exported_client_wrapper(
        self,
        context: SdkGeneratorContext,
        custom_config: SDKCustomConfig,
        project: Project,
        generated_root_client: GeneratedRootClient,
        generator_exec_wrapper: GeneratorExecWrapper,
    ) -> None:
        exported_module = custom_config.client.exported_filename.removesuffix(".py")
        exported_sync_class = context.get_class_name_for_exported_root_client()
        exported_async_class = "Async" + exported_sync_class

        filepath = Filepath(
            directories=(),
            file=Filepath.FilepathPart(module_name=exported_module),
        )
        source_file = context.source_file_factory.create(
            project=project, filepath=filepath, generator_exec_wrapper=generator_exec_wrapper
        )

        generated_filepath = context.get_filepath_for_generated_root_client()
        generated_sync_name = context.get_class_name_for_generated_root_client()
        generated_async_name = "Async" + generated_sync_name

        sync_base_class_ref = AST.ClassReference(
            import_=AST.ReferenceImport(
                module=generated_filepath.to_module(),
                named_import=generated_sync_name,
            ),
            qualified_name_excluding_import=(),
        )
        async_base_class_ref = AST.ClassReference(
            import_=AST.ReferenceImport(
                module=generated_filepath.to_module(),
                named_import=generated_async_name,
            ),
            qualified_name_excluding_import=(),
        )

        sync_class = self._create_wrapper_class_declaration(
            class_name=exported_sync_class,
            base_class_ref=sync_base_class_ref,
            root_client=generated_root_client.sync_client,
        )
        async_class = self._create_wrapper_class_declaration(
            class_name=exported_async_class,
            base_class_ref=async_base_class_ref,
            root_client=generated_root_client.async_client,
        )

        source_file.add_class_declaration(declaration=sync_class, should_export=True)
        source_file.add_class_declaration(declaration=async_class, should_export=True)

        project.write_source_file(source_file=source_file, filepath=filepath)

    @staticmethod
    def _create_wrapper_class_declaration(
        *,
        class_name: str,
        base_class_ref: AST.ClassReference,
        root_client: "RootClient",
    ) -> AST.ClassDeclaration:
        params = root_client.init_parameters if root_client.init_parameters is not None else root_client.parameters

        if root_client.constructor_overloads is not None:
            # When the base class has overloaded __init__ (e.g. OAuth + token),
            # mirror the overloads on the wrapper and use **kwargs pass-through
            # so the call to super().__init__() satisfies mypy without type: ignore.
            def write_kwargs_super_init(writer: AST.NodeWriter) -> None:
                writer.write_line("super().__init__(**kwargs)")

            return AST.ClassDeclaration(
                name=class_name,
                extends=[base_class_ref],
                constructor=AST.ClassConstructor(
                    signature=AST.FunctionSignature(include_kwargs=True),
                    body=AST.CodeWriter(write_kwargs_super_init),
                    overloads=root_client.constructor_overloads,
                ),
            )

        named_params = [
            AST.NamedFunctionParameter(
                name=param.constructor_parameter_name,
                type_hint=param.type_hint,
                initializer=param.initializer,
            )
            for param in params
        ]

        def write_super_init(writer: AST.NodeWriter) -> None:
            writer.write_line("super().__init__(")
            with writer.indent():
                for param in params:
                    writer.write_line(f"{param.constructor_parameter_name}={param.constructor_parameter_name},")
            writer.write_line(")")

        return AST.ClassDeclaration(
            name=class_name,
            extends=[base_class_ref],
            constructor=AST.ClassConstructor(
                signature=AST.FunctionSignature(named_parameters=named_params),
                body=AST.CodeWriter(write_super_init),
            ),
        )

    def _generate_subpackage_client(
        self,
        context: SdkGeneratorContext,
        generator_exec_wrapper: GeneratorExecWrapper,
        subpackage_id: ir_types.SubpackageId,
        subpackage: ir_types.Subpackage,
        websocket: Optional[ir_types.WebSocketChannel],
        project: Project,
        generated_root_client: GeneratedRootClient,
        snippet_registry: SnippetRegistry,
        snippet_writer: SnippetWriter,
        endpoint_metadata_collector: EndpointMetadataCollector,
    ) -> None:
        if websocket is not None and context.custom_config.should_generate_websocket_clients:
            socket_client_filepath = context.get_socket_client_filepath_for_subpackage_service(subpackage_id)
            socket_source_file = context.source_file_factory.create(
                project=project, filepath=socket_client_filepath, generator_exec_wrapper=generator_exec_wrapper
            )
            SocketClientGenerator(
                context=context,
                subpackage_id=subpackage_id,
                websocket=websocket,
                class_name=context.get_socket_client_class_name_for_subpackage_service(subpackage_id),
                async_class_name=context.get_async_socket_client_class_name_for_subpackage_service(subpackage_id),
                generated_root_client=generated_root_client,
            ).generate(source_file=socket_source_file)
            project.write_source_file(source_file=socket_source_file, filepath=socket_client_filepath)

        client_filepath = context.get_client_filepath_for_subpackage_service(subpackage_id)
        client_source_file = context.source_file_factory.create(
            project=project, filepath=client_filepath, generator_exec_wrapper=generator_exec_wrapper
        )
        ClientGenerator(
            context=context,
            package=subpackage,
            subpackage_id=subpackage_id,
            class_name=context.get_client_class_name_for_subpackage_service(subpackage_id),
            async_class_name=context.get_class_name_of_async_subpackage_service(subpackage_id),
            generated_root_client=generated_root_client,
            snippet_registry=snippet_registry,
            snippet_writer=snippet_writer,
            endpoint_metadata_collector=endpoint_metadata_collector,
            websocket=websocket,
            imports_manager=client_source_file.get_imports_manager(),
            reference_resolver=client_source_file.get_reference_resolver(),
        ).generate(source_file=client_source_file)
        project.write_source_file(source_file=client_source_file, filepath=client_filepath)

        raw_client_filepath = context.get_raw_client_filepath_for_subpackage_service(subpackage_id)
        raw_client_source_file = context.source_file_factory.create(
            project=project, filepath=raw_client_filepath, generator_exec_wrapper=generator_exec_wrapper
        )
        RawClientGenerator(
            context=context,
            package=subpackage,
            subpackage_id=subpackage_id,
            class_name=context.get_raw_client_class_name_for_subpackage_service(subpackage_id),
            async_class_name=context.get_async_raw_client_class_name_for_subpackage_service(subpackage_id),
            generated_root_client=generated_root_client,
            snippet_registry=snippet_registry,
            snippet_writer=snippet_writer,
            endpoint_metadata_collector=endpoint_metadata_collector,
            websocket=websocket,
            imports_manager=raw_client_source_file.get_imports_manager(),
            reference_resolver=raw_client_source_file.get_reference_resolver(),
        ).generate(source_file=raw_client_source_file)
        project.write_source_file(source_file=raw_client_source_file, filepath=raw_client_filepath)

    def _generate_error(
        self,
        context: SdkGeneratorContext,
        generator_exec_wrapper: GeneratorExecWrapper,
        error: ir_types.ErrorDeclaration,
        project: Project,
    ) -> None:
        filepath = context.get_filepath_for_error(error.name)
        source_file = context.source_file_factory.create(
            project=project, filepath=filepath, generator_exec_wrapper=generator_exec_wrapper
        )
        ErrorGenerator(context=context, error=error).generate(source_file=source_file)
        project.write_source_file(source_file=source_file, filepath=filepath)

    def _generate_aiohttp_test(
        self,
        context: SdkGeneratorContext,
        project: Project,
    ) -> None:
        module_path = project.get_module_path_for_imports()
        client_filename = context.custom_config.client_filename or context.custom_config.client.filename
        client_module = client_filename.removesuffix(".py")
        dist_name = project._project_config.package_name if project._project_config is not None else module_path
        contents = f'''import importlib
import sys
import unittest
from unittest import mock

import httpx
import pytest


class TestMakeDefaultAsyncClientWithoutAiohttp(unittest.TestCase):
    """Tests for _make_default_async_client when httpx_aiohttp is NOT installed."""

    def test_returns_httpx_async_client(self) -> None:
        """When httpx_aiohttp is not installed, returns plain httpx.AsyncClient."""
        with mock.patch.dict(sys.modules, {{"httpx_aiohttp": None}}):
            from {module_path}.{client_module} import _make_default_async_client

            client = _make_default_async_client(timeout=60, follow_redirects=True)
            self.assertIsInstance(client, httpx.AsyncClient)
            self.assertEqual(client.timeout.read, 60)
            self.assertTrue(client.follow_redirects)

    def test_follow_redirects_none(self) -> None:
        """When follow_redirects is None, omits it from httpx.AsyncClient."""
        with mock.patch.dict(sys.modules, {{"httpx_aiohttp": None}}):
            from {module_path}.{client_module} import _make_default_async_client

            client = _make_default_async_client(timeout=60, follow_redirects=None)
            self.assertIsInstance(client, httpx.AsyncClient)
            self.assertFalse(client.follow_redirects)

    def test_explicit_httpx_client_bypasses_autodetect(self) -> None:
        """When user passes httpx_client explicitly, _make_default_async_client is not called."""
        from {module_path}.{client_module} import _make_default_async_client

        explicit_client = httpx.AsyncClient(timeout=120)
        with mock.patch("{module_path}.{client_module}._make_default_async_client") as mock_make:
            # Replicate the generated conditional: httpx_client if httpx_client is not None else _make_default_async_client(...)
            result = explicit_client if explicit_client is not None else mock_make(timeout=60, follow_redirects=True)
            mock_make.assert_not_called()
        self.assertIs(result, explicit_client)


@pytest.mark.aiohttp
class TestMakeDefaultAsyncClientWithAiohttp(unittest.TestCase):
    """Tests for _make_default_async_client when httpx_aiohttp IS installed."""

    def test_returns_aiohttp_client(self) -> None:
        """When httpx_aiohttp is installed, returns HttpxAiohttpClient."""
        import httpx_aiohttp  # type: ignore[import-not-found]

        from {module_path}.{client_module} import _make_default_async_client

        client = _make_default_async_client(timeout=60, follow_redirects=True)
        self.assertIsInstance(client, httpx_aiohttp.HttpxAiohttpClient)
        self.assertEqual(client.timeout.read, 60)
        self.assertTrue(client.follow_redirects)

    def test_follow_redirects_none(self) -> None:
        """When httpx_aiohttp is installed and follow_redirects is None, omits it."""
        import httpx_aiohttp  # type: ignore[import-not-found]

        from {module_path}.{client_module} import _make_default_async_client

        client = _make_default_async_client(timeout=60, follow_redirects=None)
        self.assertIsInstance(client, httpx_aiohttp.HttpxAiohttpClient)
        self.assertFalse(client.follow_redirects)


class TestDefaultClientsWithoutAiohttp(unittest.TestCase):
    """Tests for _default_clients.py convenience classes (no aiohttp)."""

    def test_default_async_httpx_client_defaults(self) -> None:
        """DefaultAsyncHttpxClient applies SDK defaults."""
        from {module_path}._default_clients import SDK_DEFAULT_TIMEOUT, DefaultAsyncHttpxClient

        client = DefaultAsyncHttpxClient()
        self.assertIsInstance(client, httpx.AsyncClient)
        self.assertEqual(client.timeout.read, SDK_DEFAULT_TIMEOUT)
        self.assertTrue(client.follow_redirects)

    def test_default_async_httpx_client_overrides(self) -> None:
        """DefaultAsyncHttpxClient allows overriding defaults."""
        from {module_path}._default_clients import DefaultAsyncHttpxClient

        client = DefaultAsyncHttpxClient(timeout=30, follow_redirects=False)
        self.assertEqual(client.timeout.read, 30)
        self.assertFalse(client.follow_redirects)

    def test_default_aiohttp_client_raises_without_package(self) -> None:
        """DefaultAioHttpClient raises RuntimeError when httpx_aiohttp not installed."""
        import {module_path}._default_clients

        with mock.patch.dict(sys.modules, {{"httpx_aiohttp": None}}):
            importlib.reload({module_path}._default_clients)

            with self.assertRaises(RuntimeError) as ctx:
                {module_path}._default_clients.DefaultAioHttpClient()
            self.assertIn("pip install {dist_name}[aiohttp]", str(ctx.exception))

        importlib.reload({module_path}._default_clients)


@pytest.mark.aiohttp
class TestDefaultClientsWithAiohttp(unittest.TestCase):
    """Tests for _default_clients.py when httpx_aiohttp IS installed."""

    def test_default_aiohttp_client_defaults(self) -> None:
        """DefaultAioHttpClient works when httpx_aiohttp is installed."""
        import httpx_aiohttp  # type: ignore[import-not-found]

        from {module_path}._default_clients import SDK_DEFAULT_TIMEOUT, DefaultAioHttpClient

        client = DefaultAioHttpClient()
        self.assertIsInstance(client, httpx_aiohttp.HttpxAiohttpClient)
        self.assertEqual(client.timeout.read, SDK_DEFAULT_TIMEOUT)
        self.assertTrue(client.follow_redirects)
'''
        project.add_source_file("tests/test_aiohttp_autodetect.py", contents)

        # Generate a minimal tests/conftest.py with aiohttp skip logic when wire tests
        # are not enabled (wire-test projects get this from WireTestSetupGenerator).
        wire_tests_enabled = context.custom_config.enable_wire_tests or (
            context.custom_config.wire_tests is not None and context.custom_config.wire_tests.enabled
        )
        if not wire_tests_enabled:
            conftest_contents = '''import pytest


def _has_httpx_aiohttp() -> bool:
    """Check if httpx_aiohttp is importable."""
    try:
        import httpx_aiohttp  # type: ignore[import-not-found]  # noqa: F401

        return True
    except ImportError:
        return False


def pytest_collection_modifyitems(config: pytest.Config, items: list) -> None:
    """Auto-skip @pytest.mark.aiohttp tests when httpx_aiohttp is not installed."""
    if _has_httpx_aiohttp():
        return
    skip_aiohttp = pytest.mark.skip(reason="httpx_aiohttp not installed")
    for item in items:
        if "aiohttp" in item.keywords:
            item.add_marker(skip_aiohttp)
'''
            project.add_source_file("tests/conftest.py", conftest_contents)

    def _generate_default_clients(
        self,
        context: SdkGeneratorContext,
        project: Project,
    ) -> None:
        package_name = project._project_config.package_name if project._project_config is not None else "package"
        filepath = Filepath(
            directories=(),
            file=Filepath.FilepathPart(module_name="_default_clients"),
        )
        filepath_nested = project.get_source_file_filepath(filepath, include_src_root=True)
        contents = f"""# This file was auto-generated by Fern from our API Definition.

import typing

import httpx

SDK_DEFAULT_TIMEOUT = 60

try:
    import httpx_aiohttp  # type: ignore[import-not-found]
except ImportError:

    class DefaultAioHttpClient(httpx.AsyncClient):  # type: ignore
        def __init__(self, **kwargs: typing.Any) -> None:
            raise RuntimeError(
                "To use the aiohttp client, install the aiohttp extra: "
                "pip install {package_name}[aiohttp]"
            )

else:

    class DefaultAioHttpClient(httpx_aiohttp.HttpxAiohttpClient):  # type: ignore
        def __init__(self, **kwargs: typing.Any) -> None:
            kwargs.setdefault("timeout", SDK_DEFAULT_TIMEOUT)
            kwargs.setdefault("follow_redirects", True)
            super().__init__(**kwargs)


class DefaultAsyncHttpxClient(httpx.AsyncClient):
    def __init__(self, **kwargs: typing.Any) -> None:
        kwargs.setdefault("timeout", SDK_DEFAULT_TIMEOUT)
        kwargs.setdefault("follow_redirects", True)
        super().__init__(**kwargs)
"""
        project.add_file(filepath_nested, contents)
        project.register_export_in_project(
            filepath_in_project=filepath,
            exports={"DefaultAioHttpClient", "DefaultAsyncHttpxClient"},
        )

    def _generate_version(
        self,
        project: Project,
    ) -> None:
        if project._project_config is not None:
            filepath = Filepath(
                directories=(),
                file=Filepath.FilepathPart(module_name="version"),
            )
            filepath_nested = project.get_source_file_filepath(filepath, include_src_root=True)
            contents = f"""
from importlib import metadata

__version__ = metadata.version("{project._project_config.package_name}")
"""
            project.add_file(filepath_nested, contents)
            project.register_export_in_project(
                filepath_in_project=filepath,
                exports={"__version__"},
            )

    def _maybe_write_snippets(
        self,
        context: SdkGeneratorContext,
        snippets: Snippets,
        project: Project,
    ) -> None:
        if context.generator_config.output.snippet_filepath is not None:
            project.add_file(context.generator_config.output.snippet_filepath, snippets.json(indent=4))

    def _write_snippet_tests(
        self,
        snippet_test_factory: SnippetTestFactory,
        snippet_writer: SnippetWriter,
        ir: ir_types.IntermediateRepresentation,
    ) -> None:
        snippet_test_factory.tests(ir, snippet_writer)

    def get_sorted_modules(self) -> Sequence[str]:
        # always import types/errors before resources (nested packages)
        # to avoid issues with circular imports
        return [".types", ".errors", ".resources"]

    def is_flat_layout(
        self,
        *,
        generator_config: GeneratorConfig,
    ) -> bool:
        custom_config = SDKCustomConfig.parse_obj(generator_config.custom_config or {})
        return custom_config.flat_layout
