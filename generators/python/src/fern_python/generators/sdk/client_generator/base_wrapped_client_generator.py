from typing import Generic

import fern.ir.resources as ir_types
from .base_client_generator import BaseClientGenerator, ConstructorParameterT
from .endpoint_function_generator import EndpointFunctionGenerator
from .generated_root_client import GeneratedRootClient

from fern_python.codegen import AST


class BaseWrappedClientGenerator(Generic[ConstructorParameterT], BaseClientGenerator[ConstructorParameterT]):
    """Base class for client generators that wrap a raw client."""

    def _create_with_raw_response_method(self, *, is_async: bool) -> AST.FunctionDeclaration:
        """Create a method that returns the raw client for more control over the response."""

        def write_docstring(writer: AST.NodeWriter) -> None:
            raw_client_class_name = self.get_raw_client_class_name(is_async=is_async)
            writer.write_line("Retrieves a raw implementation of this client that returns raw responses.")
            writer.write_line()
            writer.write_line("Returns")
            writer.write_line("-------")
            writer.write_line(raw_client_class_name)

        def write_method_body(writer: AST.NodeWriter) -> None:
            writer.write_line(f"return self.{self._get_raw_client_member_name()}")

        raw_client_reference = self.get_raw_client_class_reference(is_async=is_async)

        return AST.FunctionDeclaration(
            name="with_raw_response",
            is_async=False,
            signature=AST.FunctionSignature(parameters=[], return_type=AST.TypeHint(raw_client_reference)),
            docstring=AST.CodeWriter(write_docstring),
            body=AST.CodeWriter(write_method_body),
            decorators=[AST.Expression(AST.Reference(qualified_name_excluding_import=("property",), import_=None))],
        )

    def _add_wrapped_client_methods(
        self,
        *,
        is_async: bool,
        service: ir_types.HttpService,
        class_declaration: AST.ClassDeclaration,
        generated_root_client: GeneratedRootClient,
    ) -> None:
        for endpoint in service.endpoints:
            # TODO: Roll out Stream Parameter endpoints.
            if self._is_stream_parameter_endpoint(endpoint):
                endpoint_generator = EndpointFunctionGenerator(
                    context=self._context,
                    package=self._package,
                    service=service,
                    endpoint=endpoint,
                    idempotency_headers=self._context.ir.idempotency_headers,
                    is_async=is_async,
                    client_wrapper_member_name=f"{self._get_raw_client_member_name()}.{self._get_client_wrapper_member_name()}",
                    generated_root_client=generated_root_client,
                    snippet_writer=self._snippet_writer,
                    endpoint_metadata_collector=self._endpoint_metadata_collector,
                    is_raw_client=False,
                )

                generated_endpoint_functions = endpoint_generator.generate()
                for generated_function in generated_endpoint_functions:
                    if generated_function.is_default_body_parameter_used:
                        self._is_default_body_parameter_used = True

                for overload_function in generated_endpoint_functions[:-1]:
                    class_declaration.add_method(overload_function.function)

                class_declaration.add_method(generated_endpoint_functions[-1].function)
            else:
                wrapper_method = self._create_wrapper_method(
                    endpoint=endpoint, is_async=is_async, generated_root_client=generated_root_client
                )
                class_declaration.add_method(wrapper_method)

    def _create_wrapper_method(
        self, endpoint: ir_types.HttpEndpoint, is_async: bool, generated_root_client: GeneratedRootClient
    ) -> AST.FunctionDeclaration:
        """Create a method that delegates to the raw client and extracts the data property."""
        if self._is_stream_parameter_endpoint(endpoint):
            return AST.FunctionDeclaration(
                name="placeholder",
                is_async=is_async,
                signature=AST.FunctionSignature(parameters=[], return_type=AST.TypeHint.none()),
                body=AST.CodeWriter(lambda writer: writer.write_line("pass")),
                decorators=[],
            )

        # Use EndpointFunctionGenerator to create the wrapper method
        if self._package.service is None:
            raise ValueError("Package must have a service to generate endpoints")

        endpoint_generator = EndpointFunctionGenerator(
            context=self._context,
            package=self._package,
            service=self._context.ir.services[self._package.service],
            endpoint=endpoint,
            idempotency_headers=self._context.ir.idempotency_headers,
            is_async=is_async,
            # Use raw_client's client_wrapper instead of direct client_wrapper
            client_wrapper_member_name=f"{self._get_raw_client_member_name()}.{self._get_client_wrapper_member_name()}",
            generated_root_client=generated_root_client,
            snippet_writer=self._snippet_writer,
            endpoint_metadata_collector=self._endpoint_metadata_collector,
            is_raw_client=False,
        )

        # Check if any generated function needs DEFAULT_BODY_PARAMETER
        generated_endpoint_functions = endpoint_generator.generate()
        for generated_function in generated_endpoint_functions:
            if generated_function.is_default_body_parameter_used:
                self._is_default_body_parameter_used = True
                break

        # Generate the wrapper function that uses context manager for streaming endpoints
        return endpoint_generator.generate_wrapper_function()
