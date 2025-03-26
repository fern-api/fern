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
from src.fern_python.external_dependencies.json import Json
from src.fern_python.external_dependencies.websockets import Websockets
from src.fern_python.generators.core_utilities.core_utilities import CoreUtilities

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
    WEBSOCKET_MEMBER_NAME = "_websocket"

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
        class_declaration = self._create_class_declaration()
        source_file.add_class_declaration(
            declaration=class_declaration,
            should_export=False,
        )

    def _create_class_declaration(self) -> AST.ClassDeclaration:
        constructor_parameters = self._get_constructor_parameters()

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
                body=AST.CodeWriter(self._get_write_constructor_body()),
            ),
        )
        class_declaration.add_method(self._get_aiter_method())
        class_declaration.add_method(self._get_send_method())
        class_declaration.add_method(self._get_recv_method())
        class_declaration.add_method(self._get_send_model_method())
        return class_declaration

    def _get_constructor_parameters(self) -> List[ConstructorParameter]:
        parameters: List[ConstructorParameter] = [
            ConstructorParameter(
                constructor_parameter_name=WebsocketConnectMethodGenerator.SOCKET_CONSTRUCTOR_PARAMETER_NAME,
                private_member_name=self.WEBSOCKET_MEMBER_NAME,
                type_hint=AST.TypeHint(Websockets.get_websocket_client_protocol()),
            )
        ]

        return parameters

    def _get_write_constructor_body(self) -> CodeWriterFunction:
        def _write_constructor_body(writer: AST.NodeWriter) -> None:
            constructor_parameters = self._get_constructor_parameters()
            for param in constructor_parameters:
                if param.private_member_name is not None:
                    writer.write_line(f"self.{param.private_member_name} = {param.constructor_parameter_name}")

        return _write_constructor_body

    def _get_aiter_method(self) -> AST.FunctionDeclaration:
        return AST.FunctionDeclaration(
            name="__aiter__",
            is_async=True,
            signature=AST.FunctionSignature(),
            body=AST.CodeWriter(self._get_aiter_method_body()),
        )

    def _get_aiter_method_body(self) -> CodeWriterFunction:
        def _get_aiter_method_body(writer: AST.NodeWriter) -> None:
            writer.write_line(f"async for message in self.{self.WEBSOCKET_MEMBER_NAME}:")
            with writer.indent():
                writer.write("yield ")
                writer.write_reference(self._context.core_utilities.get_parse_obj_as())
                # TODO: Create unioned type and parse as it.
                writer.write("(str, message)")

        return _get_aiter_method_body

    def _get_send_method(self) -> AST.FunctionDeclaration:
        return AST.FunctionDeclaration(
            name="_send",
            is_async=True,
            signature=AST.FunctionSignature(
                parameters=[
                    AST.FunctionParameter(
                        name="data",
                        type_hint=AST.TypeHint.any(),
                    ),
                ],
                return_type=AST.TypeHint.none(),
            ),
            body=AST.CodeWriter(self._get_send_method_body()),
        )

    def _get_send_method_body(self) -> CodeWriterFunction:
        def _get_send_method_body(writer: AST.NodeWriter) -> None:
            writer.write_line("if isinstance(data, dict):")
            with writer.indent():
                writer.write("data = ")
                writer.write_node(Json.dumps(AST.Expression("data")))
                writer.write_line()
            writer.write_line(f"await self.{self.WEBSOCKET_MEMBER_NAME}.send(data)")

        return _get_send_method_body

    def _get_recv_method(self) -> AST.FunctionDeclaration:
        return AST.FunctionDeclaration(
            name="_recv",
            is_async=True,
            signature=AST.FunctionSignature(
                return_type=AST.TypeHint.any(),
            ),
            body=AST.CodeWriter(self._get_recv_method_body()),
        )

    def _get_recv_method_body(self) -> CodeWriterFunction:
        def _get_recv_method_body(writer: AST.NodeWriter) -> None:
            writer.write_line(f"data = await self.{self.WEBSOCKET_MEMBER_NAME}.recv()")
            writer.write("return ")
            writer.write_reference(self._context.core_utilities.get_parse_obj_as())
            writer.write("(")
            writer.write_node(AST.TypeHint.any())
            writer.write(", data)")

        return _get_recv_method_body

    def _get_send_model_method(self) -> AST.FunctionDeclaration:
        return AST.FunctionDeclaration(
            name="_send_model",
            is_async=True,
            signature=AST.FunctionSignature(
                parameters=[
                    AST.FunctionParameter(
                        name="data",
                        type_hint=AST.TypeHint.any(),
                    ),
                ],
                return_type=AST.TypeHint.none(),
            ),
            body=AST.CodeWriter(self._get_send_model_method_body()),
        )

    def _get_send_model_method_body(self) -> CodeWriterFunction:
        def _get_send_model_method_body(writer: AST.NodeWriter) -> None:
            writer.write_line(f"await self._send(data.dict())")

        return _get_send_model_method_body
