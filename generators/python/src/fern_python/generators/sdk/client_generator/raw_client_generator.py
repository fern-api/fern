from typing import List

import fern.ir.resources as ir_types
from .base_client_generator import BaseClientGenerator, BaseClientGeneratorKwargs, ConstructorParameter
from .endpoint_function_generator import EndpointFunctionGenerator
from .websocket_connect_method_generator import WebsocketConnectMethodGenerator
from typing_extensions import Unpack

from fern_python.codegen import AST, SourceFile
from fern_python.codegen.ast.nodes.code_writer.code_writer import CodeWriterFunction
from fern_python.generators.sdk.client_generator.generated_root_client import GeneratedRootClient


class RawClientGenerator(BaseClientGenerator[ConstructorParameter]):
    def __init__(
        self,
        subpackage_id: ir_types.SubpackageId,
        generated_root_client: GeneratedRootClient,
        **kwargs: Unpack[BaseClientGeneratorKwargs],
    ):
        super().__init__(
            **kwargs,
        )
        self._subpackage_id = subpackage_id
        self._generated_root_client = generated_root_client

    def generate(self, source_file: SourceFile) -> None:
        class_declaration = self._create_class_declaration(is_async=False)
        if self._is_default_body_parameter_used:
            source_file.add_arbitrary_code(AST.CodeWriter(self._write_default_param))
        source_file.add_class_declaration(
            declaration=class_declaration,
            should_export=False,
        )
        source_file.add_class_declaration(
            declaration=self._create_class_declaration(is_async=True),
            should_export=False,
        )

    def _create_class_declaration(self, *, is_async: bool) -> AST.ClassDeclaration:
        # Use the base implementation to create the class declaration
        class_declaration = self._create_class_declaration_base(is_async=is_async)

        if self._package.service is not None:
            service = self._context.ir.services[self._package.service]
            for endpoint in service.endpoints:
                endpoint_function_generator = EndpointFunctionGenerator(
                    context=self._context,
                    package=self._package,
                    service=service,
                    endpoint=endpoint,
                    idempotency_headers=self._context.ir.idempotency_headers,
                    is_async=is_async,
                    client_wrapper_member_name=self._get_client_wrapper_member_name(),
                    generated_root_client=self._generated_root_client,
                    snippet_writer=self._snippet_writer,
                    endpoint_metadata_collector=self._endpoint_metadata_collector,
                    is_raw_client=True,
                )
                generated_endpoint_functions = endpoint_function_generator.generate()
                for generated_endpoint_function in generated_endpoint_functions:
                    class_declaration.add_method(generated_endpoint_function.function)
                    if (
                        not self._is_default_body_parameter_used
                        and generated_endpoint_function.is_default_body_parameter_used
                    ):
                        self._is_default_body_parameter_used = True

                    for snippet in generated_endpoint_function.snippets or []:
                        if is_async:
                            self._snippet_registry.register_async_client_endpoint_snippet(
                                endpoint=endpoint, expr=snippet.snippet, example_id=snippet.example_id
                            )
                        else:
                            self._snippet_registry.register_sync_client_endpoint_snippet(
                                endpoint=endpoint, expr=snippet.snippet, example_id=snippet.example_id
                            )
        if self._websocket is not None and self._context.custom_config.should_generate_websocket_clients:
            websocket_connect_method_generator = WebsocketConnectMethodGenerator(
                context=self._context,
                package=self._package,
                subpackage_id=self._subpackage_id,
                websocket=self._websocket,
                client_wrapper_member_name=self._get_client_wrapper_member_name(),
                is_async=is_async,
            )
            generated_connect_method = websocket_connect_method_generator.generate()
            class_declaration.add_method(generated_connect_method.function)
        return class_declaration

    def _get_constructor_parameters(self, *, is_async: bool) -> List[ConstructorParameter]:
        return [
            ConstructorParameter(
                constructor_parameter_name=self._get_client_wrapper_constructor_parameter_name(),
                private_member_name=self._get_client_wrapper_member_name(),
                type_hint=AST.TypeHint(self._context.core_utilities.get_reference_to_client_wrapper(is_async=is_async)),
            )
        ]

    def _get_write_constructor_body(self, *, is_async: bool) -> CodeWriterFunction:
        def _write_constructor_body(writer: AST.NodeWriter) -> None:
            constructor_parameters = self._get_constructor_parameters(is_async=is_async)
            base_writer = self._get_write_constructor_body_base(constructor_parameters=constructor_parameters)
            base_writer(writer)

        return _write_constructor_body

    def _get_client_wrapper_constructor_parameter_name(self) -> str:
        return "client_wrapper"

    def get_raw_client_class_name(self, *, is_async: bool) -> str:
        return (
            self._context.get_async_raw_client_class_name_for_subpackage_service(self._subpackage_id)
            if is_async
            else self._context.get_raw_client_class_name_for_subpackage_service(self._subpackage_id)
        )

    def get_raw_client_class_reference(self, *, is_async: bool) -> AST.ClassReference:
        return (
            self._context.get_async_raw_client_class_reference_for_subpackage_service(self._subpackage_id)
            if is_async
            else self._context.get_raw_client_class_reference_for_subpackage_service(self._subpackage_id)
        )
