import typing
from dataclasses import dataclass
from typing import List, Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST, SourceFile
from fern_python.codegen.ast.nodes.code_writer.code_writer import CodeWriterFunction
from fern_python.generators.sdk.client_generator.endpoint_metadata_collector import (
    EndpointMetadataCollector,
)
from fern_python.generators.sdk.client_generator.endpoint_response_code_writer import (
    EndpointResponseCodeWriter,
)
from fern_python.snippet import SnippetRegistry, SnippetWriter

from ..context.sdk_generator_context import SdkGeneratorContext
from .constants import DEFAULT_BODY_PARAMETER_VALUE
from .endpoint_function_generator import EndpointFunctionGenerator
from .generated_root_client import GeneratedRootClient


@dataclass
class ConstructorParameter:
    constructor_parameter_name: str
    type_hint: AST.TypeHint
    private_member_name: typing.Optional[str] = None
    initializer: Optional[AST.Expression] = None


HTTPX_PRIMITIVE_DATA_TYPES = set(
    [
        ir_types.PrimitiveTypeV1.STRING,
        ir_types.PrimitiveTypeV1.INTEGER,
        ir_types.PrimitiveTypeV1.DOUBLE,
        ir_types.PrimitiveTypeV1.BOOLEAN,
    ]
)


class ClientGenerator:
    RESPONSE_VARIABLE = EndpointResponseCodeWriter.RESPONSE_VARIABLE
    RESPONSE_JSON_VARIABLE = EndpointResponseCodeWriter.RESPONSE_JSON_VARIABLE

    TOKEN_CONSTRUCTOR_PARAMETER_NAME = "token"
    TOKEN_MEMBER_NAME = "_token"

    def __init__(
        self,
        *,
        context: SdkGeneratorContext,
        package: ir_types.Package,
        class_name: str,
        async_class_name: str,
        generated_root_client: GeneratedRootClient,
        snippet_registry: SnippetRegistry,
        snippet_writer: SnippetWriter,
        endpoint_metadata_collector: EndpointMetadataCollector,
    ):
        self._context = context
        self._package = package
        self._class_name = class_name
        self._async_class_name = async_class_name
        self._generated_root_client = generated_root_client
        self._snippet_registry = snippet_registry
        self._snippet_writer = snippet_writer
        self._is_default_body_parameter_used = False
        self._endpoint_metadata_collector = endpoint_metadata_collector

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
        constructor_parameters = self._get_constructor_parameters(is_async=is_async)

        named_parameters = [
            AST.NamedFunctionParameter(
                name=param.constructor_parameter_name,
                type_hint=param.type_hint,
                initializer=param.initializer,
            )
            for param in constructor_parameters
        ]

        class_declaration = AST.ClassDeclaration(
            name=self._async_class_name if is_async else self._class_name,
            constructor=AST.ClassConstructor(
                signature=AST.FunctionSignature(
                    named_parameters=named_parameters,
                ),
                body=AST.CodeWriter(self._get_write_constructor_body(is_async=is_async)),
            ),
        )

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

        return class_declaration

    def _get_constructor_parameters(self, *, is_async: bool) -> List[ConstructorParameter]:
        parameters: List[ConstructorParameter] = []

        parameters.append(
            ConstructorParameter(
                constructor_parameter_name=self._get_client_wrapper_constructor_parameter_name(),
                private_member_name=self._get_client_wrapper_member_name(),
                type_hint=AST.TypeHint(self._context.core_utilities.get_reference_to_client_wrapper(is_async=is_async)),
            )
        )

        return parameters

    def _environment_is_enum(self) -> bool:
        return self._context.ir.environments is not None

    def _get_write_constructor_body(self, *, is_async: bool) -> CodeWriterFunction:
        def _write_constructor_body(writer: AST.NodeWriter) -> None:
            constructor_parameters = self._get_constructor_parameters(is_async=is_async)
            for param in constructor_parameters:
                if param.private_member_name is not None:
                    writer.write_line(f"self.{param.private_member_name} = {param.constructor_parameter_name}")
            for subpackage_id in self._package.subpackages:
                subpackage = self._context.ir.subpackages[subpackage_id]
                if subpackage.has_endpoints_in_tree:
                    writer.write_node(AST.Expression(f"self.{subpackage.name.snake_case.safe_name} = "))
                    kwargs = [
                        (param.constructor_parameter_name, AST.Expression(f"self.{param.private_member_name}"))
                        for param in self._get_constructor_parameters(is_async=is_async)
                    ]
                    writer.write_node(
                        AST.ClassInstantiation(
                            class_=self._context.get_reference_to_async_subpackage_service(subpackage_id)
                            if is_async
                            else self._context.get_reference_to_subpackage_service(subpackage_id),
                            kwargs=kwargs,
                        )
                    )
                    writer.write_line()

        return _write_constructor_body

    def _write_default_param(self, writer: AST.NodeWriter) -> None:
        writer.write_line("# this is used as the default value for optional parameters")
        writer.write(f"{DEFAULT_BODY_PARAMETER_VALUE} = ")
        writer.write_node(AST.TypeHint.cast(AST.TypeHint.any(), AST.Expression("...")))
        writer.write_newline_if_last_line_not()

    def _get_client_wrapper_constructor_parameter_name(self) -> str:
        return "client_wrapper"

    def _get_client_wrapper_member_name(self) -> str:
        return "_client_wrapper"
