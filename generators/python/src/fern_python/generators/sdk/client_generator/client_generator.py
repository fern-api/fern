from typing import List

from .base_wrapped_client_generator import BaseWrappedClientGenerator
from .base_client_generator import ConstructorParameter
from .endpoint_function_generator import EndpointFunctionGenerator
from .websocket_connect_method_generator import WebsocketConnectMethodGenerator
from fern_python.codegen import AST, SourceFile
from fern_python.codegen.ast.nodes.code_writer.code_writer import CodeWriterFunction


class ClientGenerator(BaseWrappedClientGenerator):
    def generate(self, source_file: SourceFile) -> None:
        class_declaration = self._create_class_declaration(is_async=False)
        async_class_declaration = self._create_class_declaration(is_async=True)

        if self._is_default_body_parameter_used:
            source_file.add_arbitrary_code(AST.CodeWriter(self._write_default_param))

        source_file.add_class_declaration(
            declaration=class_declaration,
            should_export=False,
        )
        source_file.add_class_declaration(
            declaration=async_class_declaration,
            should_export=False,
        )

    def _create_class_declaration(self, *, is_async: bool) -> AST.ClassDeclaration:
        # Use the base implementation to create the class declaration
        class_declaration = self._create_class_declaration_base(is_async=is_async)

        # Add with_raw_response property (method with @property decorator)
        class_declaration.add_method(self._create_with_raw_response_method(is_async=is_async))

        if self._package.service is not None:
            service = self._context.ir.services[self._package.service]
            for endpoint in service.endpoints:
                # Handle stream parameter endpoints specially to ensure all overloads are included
                if self._is_stream_parameter_endpoint(endpoint):
                    endpoint_generator = EndpointFunctionGenerator(
                        context=self._context,
                        package=self._package,
                        service=service,
                        endpoint=endpoint,
                        idempotency_headers=self._context.ir.idempotency_headers,
                        is_async=is_async,
                        client_wrapper_member_name=f"{self._get_raw_client_member_name()}.{self._get_client_wrapper_member_name()}",
                        generated_root_client=self._generated_root_client,
                        snippet_writer=self._snippet_writer,
                        endpoint_metadata_collector=self._endpoint_metadata_collector,
                        is_raw_client=False,
                    )

                    # Generate all functions (overloads + implementation)
                    generated_endpoint_functions = endpoint_generator.generate()

                    # Check if any generated function needs DEFAULT_BODY_PARAMETER
                    for generated_function in generated_endpoint_functions:
                        if generated_function.is_default_body_parameter_used:
                            self._is_default_body_parameter_used = True
                            break

                    # Add all overloads first
                    for overload_function in generated_endpoint_functions[:-1]:
                        class_declaration.add_method(overload_function.function)

                    # Then add the implementation
                    class_declaration.add_method(generated_endpoint_functions[-1].function)
                else:
                    # For non-stream parameter endpoints, use the regular approach
                    wrapper_method = self._create_wrapper_method(endpoint=endpoint, is_async=is_async, generated_root_client=self._generated_root_client)
                    class_declaration.add_method(wrapper_method)

        if self._websocket is not None and self._context.custom_config.should_generate_websocket_clients:
            websocket_connect_method_generator = WebsocketConnectMethodGenerator(
                context=self._context,
                package=self._package,
                subpackage_id=self._subpackage_id,
                websocket=self._websocket,
                client_wrapper_member_name=f"{self._get_raw_client_member_name()}.{self._get_client_wrapper_member_name()}",
                is_async=is_async,
            )
            generated_connect_method = websocket_connect_method_generator.generate()
            class_declaration.add_method(generated_connect_method.function)

        return class_declaration


    def get_raw_client_class_name(self, *, is_async: bool) -> str:
        return (
            self._context.get_async_raw_client_class_name_for_subpackage_service(self._subpackage_id)
            if is_async
            else self._context.get_raw_client_class_name_for_subpackage_service(self._subpackage_id)
        )
    
    def get_raw_client_class_reference(self, *, is_async: bool) -> AST.TypeHint:
        return (
            self._context.get_async_raw_client_class_reference_for_subpackage_service(self._subpackage_id)
            if is_async
            else self._context.get_raw_client_class_reference_for_subpackage_service(self._subpackage_id)
        )

    def _get_constructor_parameters(self, *, is_async: bool) -> List[ConstructorParameter]:
        return [
            ConstructorParameter(
                constructor_parameter_name="client_wrapper",
                # Don't store as instance variable since we access through raw_client
                private_member_name=None,
                type_hint=AST.TypeHint(self._context.core_utilities.get_reference_to_client_wrapper(is_async=is_async)),
            )
        ]

    def _get_write_constructor_body(self, *, is_async: bool) -> CodeWriterFunction:
        def _write_constructor_body(writer: AST.NodeWriter) -> None:
            kwargs = [
                (param.constructor_parameter_name, AST.Expression(param.constructor_parameter_name))
                for param in self._get_constructor_parameters(is_async=is_async)
            ]

            # Initialize the raw client with the client_wrapper
            writer.write_node(
                AST.VariableDeclaration(
                    name=f"self.{self._get_raw_client_member_name()}",
                    initializer=AST.Expression(
                        AST.ClassInstantiation(
                            class_=(
                                self._context.get_async_raw_client_class_reference_for_subpackage_service(
                                    self._subpackage_id
                                )
                                if is_async
                                else self._context.get_raw_client_class_reference_for_subpackage_service(
                                    self._subpackage_id
                                )
                            ),
                            kwargs=kwargs,
                        )
                    ),
                )
            )

            # Initialize nested clients
            for subpackage_id in self._package.subpackages:
                subpackage = self._context.ir.subpackages[subpackage_id]
                if subpackage.has_endpoints_in_tree:
                    writer.write_node(
                        AST.VariableDeclaration(
                            name=f"self.{subpackage.name.snake_case.safe_name}",
                            initializer=AST.Expression(
                                AST.ClassInstantiation(
                                    class_=(
                                        self._context.get_reference_to_async_subpackage_service(subpackage_id)
                                        if is_async
                                        else self._context.get_reference_to_subpackage_service(subpackage_id)
                                    ),
                                    kwargs=kwargs,
                                )
                            ),
                        )
                    )
                    writer.write_line()

        return _write_constructor_body
