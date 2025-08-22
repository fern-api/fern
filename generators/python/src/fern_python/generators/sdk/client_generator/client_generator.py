from typing import List

from .base_client_generator import BaseClientGeneratorKwargs, ConstructorParameter
from .base_wrapped_client_generator import BaseWrappedClientGenerator
from .websocket_connect_method_generator import WebsocketConnectMethodGenerator
from fern_python.codegen import AST, SourceFile
from fern_python.codegen.ast.nodes.code_writer.code_writer import CodeWriterFunction
from fern_python.generators.sdk.client_generator.generated_root_client import GeneratedRootClient
from typing_extensions import Unpack

import fern.ir.resources as ir_types


class ClientGenerator(BaseWrappedClientGenerator[ConstructorParameter]):
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
            self._add_wrapped_client_methods(
                is_async=is_async,
                service=service,
                class_declaration=class_declaration,
                generated_root_client=self._generated_root_client,
            )

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

    def get_raw_client_class_reference(self, *, is_async: bool) -> AST.ClassReference:
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
                    if self._context.custom_config.lazy_imports:
                        writer.write_line(f"self._{subpackage.name.snake_case.safe_name} = None")
                    else:
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
