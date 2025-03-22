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
from .websocket_connect_method_generator import WebsocketConnectMethodGenerator


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


class SocketClientGenerator:
    RESPONSE_VARIABLE = EndpointResponseCodeWriter.RESPONSE_VARIABLE
    RESPONSE_JSON_VARIABLE = EndpointResponseCodeWriter.RESPONSE_JSON_VARIABLE

    TOKEN_CONSTRUCTOR_PARAMETER_NAME = "token"
    TOKEN_MEMBER_NAME = "_token"

    def __init__(
        self,
        *,
        context: SdkGeneratorContext,
        websocket: Optional[ir_types.WebSocketChannel],
        class_name: str,
        generated_root_client: GeneratedRootClient,
    ):
        self._context = context
        self._class_name = class_name
        self._generated_root_client = generated_root_client
        self._websocket = websocket

    def generate(self, source_file: SourceFile) -> None:
        class_declaration = self._create_class_declaration(is_async=False)
        source_file.add_class_declaration(
            declaration=class_declaration,
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
            name=self._class_name,
            constructor=AST.ClassConstructor(
                signature=AST.FunctionSignature(
                    named_parameters=named_parameters,
                ),
                body=AST.CodeWriter(self._get_write_constructor_body(is_async=is_async)),
            ),
        )

        return class_declaration

    def _get_constructor_parameters(self, *, is_async: bool) -> List[ConstructorParameter]:
        parameters: List[ConstructorParameter] = []

        return parameters

    def _environment_is_enum(self) -> bool:
        return self._context.ir.environments is not None

    def _get_write_constructor_body(self, *, is_async: bool) -> CodeWriterFunction:
        def _write_constructor_body(writer: AST.NodeWriter) -> None:
            constructor_parameters = self._get_constructor_parameters(is_async=is_async)
            for param in constructor_parameters:
                if param.private_member_name is not None:
                    writer.write_line(f"self.{param.private_member_name} = {param.constructor_parameter_name}")

                # TODO: Implement the connect method for the websocket
                # if self._websocket is not None:
                #     writer.write_node(
                #         AST.ClassInstantiation(
                #             class_=self._context.get_reference_to_websocket_connect_method(),
                #             kwargs=[],
                #         )
                #     )

                #     writer.write_node(AST.Expression(f"self.{self._websocket.name.snake_case.safe_name} = "))
                #     kwargs = [
                #         (param.constructor_parameter_name, AST.Expression(f"self.{param.private_member_name}"))
                #         for param in self._get_constructor_parameters(is_async=is_async)
                #     ]
                #     writer.write_node(
                #         AST.ClassInstantiation(
                #             class_=self._context.get_reference_to_websocket_connect_method(),
                #             kwargs=kwargs,
                #         )
                #     )
            writer.write_line("pass")

        return _write_constructor_body
